import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import {canCreateLoan} from '../config';
import {loanRepository} from '../services/storage';
import type {Loan, LoanInput} from '../types/loan';

interface LoanContextValue {
  loans: Loan[];
  canAddLoan: boolean;
  addLoan: (input: LoanInput) => Loan;
  updateLoan: (id: string, input: LoanInput) => void;
  deleteLoan: (id: string) => void;
  getLoan: (id: string) => Loan | undefined;
}

const LoanContext = createContext<LoanContextValue | null>(null);

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function LoanProvider({children}: React.PropsWithChildren) {
  const [loans, setLoans] = useState<Loan[]>(() => loanRepository.getAll());

  const commit = useCallback((updater: (current: Loan[]) => Loan[]) => {
    setLoans(current => {
      const next = updater(current);
      loanRepository.saveAll(next);
      return next;
    });
  }, []);

  const addLoan = useCallback(
    (input: LoanInput) => {
      if (!canCreateLoan(loans.length)) {
        throw new Error('Loan limit reached');
      }
      const loan: Loan = {
        ...input,
        id: makeId(),
        createdAt: new Date().toISOString(),
      };
      commit(current => [loan, ...current]);
      return loan;
    },
    [commit, loans.length],
  );

  const updateLoan = useCallback(
    (id: string, input: LoanInput) => {
      commit(current =>
        current.map(loan => (loan.id === id ? {...loan, ...input} : loan)),
      );
    },
    [commit],
  );

  const deleteLoan = useCallback(
    (id: string) => {
      commit(current => current.filter(loan => loan.id !== id));
    },
    [commit],
  );

  const value = useMemo<LoanContextValue>(
    () => ({
      loans,
      canAddLoan: canCreateLoan(loans.length),
      addLoan,
      updateLoan,
      deleteLoan,
      getLoan: id => loans.find(loan => loan.id === id),
    }),
    [addLoan, deleteLoan, loans, updateLoan],
  );

  return <LoanContext.Provider value={value}>{children}</LoanContext.Provider>;
}

export function useLoans(): LoanContextValue {
  const context = useContext(LoanContext);
  if (!context) {
    throw new Error('useLoans must be used inside LoanProvider');
  }
  return context;
}

