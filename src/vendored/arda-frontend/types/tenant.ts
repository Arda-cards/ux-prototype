export interface TenantQueryRequest {
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

export interface TenantQueryResponse {
  thisPage: string;
  nextPage: string;
  previousPage: string;
  results: TenantResult[];
}

export interface TenantResult {
  rId: string;
  asOf: {
    effective: number;
    recorded: number;
  };
  payload: TenantPayload;
  metadata: Record<string, unknown>;
  author: string;
  createdBy: string;
  createdAt: {
    effective: number;
    recorded: number;
  };
  retired: boolean;
}

export interface TenantPayload {
  eId: string;
  tenantName: string;
  company: {
    name: string;
    legalName?: string;
    country?: string;
    taxId?: string;
    registrationId?: string;
    naicsCode?: string;
  };
  plan?: string;
  settings: unknown | null;
  subscriptionReference: {
    state: string;
    acceptedTC: number;
    local: string;
    revision: string;
    homes: unknown[];
  };
}

export interface TenantGetResponse {
  rId: string;
  asOf: {
    effective: number;
    recorded: number;
  };
  payload: TenantPayload;
  metadata: Record<string, unknown>;
  author: string;
  createdBy: string;
  createdAt: {
    effective: number;
    recorded: number;
  };
  previous?: string;
  retired: boolean;
}

export interface AgentForQueryRequest {
  filter: {
    eq: string;
    locator: string;
  };
  paginate: {
    index: number;
    size: number;
  };
}

export interface AgentForQueryResponse {
  thisPage: string;
  nextPage: string;
  previousPage: string;
  results: AgentForResult[];
}

export interface AgentForResult {
  rId: string;
  asOf: {
    effective: number;
    recorded: number;
  };
  payload: AgentForPayload;
  metadata: Record<string, unknown>;
  author: string;
  createdBy: string;
  createdAt: {
    effective: number;
    recorded: number;
  };
  retired: boolean;
}

export interface AgentForPayload {
  eId: string;
  userAccount: {
    local: string;
    homes: unknown[];
  };
  tenant: {
    local: string;
    homes: unknown[];
  };
  role: string;
  status: string;
  settings: unknown | null;
}

