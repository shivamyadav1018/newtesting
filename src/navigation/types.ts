import type {NavigatorScreenParams} from '@react-navigation/native';

export type HomeStackParamList = {
  LoanList: undefined;
  LoanDetail: {loanId: string};
  Amortization: {loanId: string};
  LoanForm: {loanId?: string} | undefined;
};

export type TabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Calculator: undefined;
  Compare: undefined;
  Settings: undefined;
};

