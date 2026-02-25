export interface UserAccountQueryRequest {
  filter?: {
    eq?: string;
    locator?: string;
    in?: {
      locator: string;
      values: string | string[];
    };
  };
  paginate: {
    index: number;
    size: number;
  };
}

export interface UserAccountQueryResponse {
  thisPage: string;
  nextPage: string;
  previousPage: string;
  results: UserAccountResult[];
}

export interface UserAccountResult {
  rId: string;
  asOf: {
    effective: number;
    recorded: number;
  };
  payload: UserAccountPayload;
  metadata: Record<string, unknown>;
  author: string;
  createdBy: string;
  createdAt: {
    effective: number;
    recorded: number;
  };
  retired: boolean;
}

export interface UserAccountPayload {
  eId: string;
  oidcSub: string;
  identity: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email: string;
    emails: Record<string, unknown>;
    phones: Record<string, unknown>;
    addresses: Record<string, unknown>;
    sites: Record<string, unknown>;
  };
  settings: Record<string, unknown>;
  subscription: {
    state: string;
    acceptedTC: number;
  };
  activeAgency: {
    local: string;
    homes: unknown[];
    tenant: string;
  };
}

