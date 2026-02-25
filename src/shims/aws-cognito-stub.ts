/**
 * Stub shim for @aws-sdk/client-cognito-identity-provider
 *
 * In Storybook, the real Cognito client is never used — MockAuthProvider
 * replaces AuthProvider. This stub provides the exported classes/types
 * that vendored code references at the module level so that Vite can
 * resolve the imports without installing the full AWS SDK.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export class CognitoIdentityProviderClient {
  constructor(_config: any) {
    // stub
  }
  send(_command: any): Promise<any> {
    throw new Error(
      '[Storybook stub] CognitoIdentityProviderClient.send() called — use MockAuthProvider instead',
    );
  }
}

export class InitiateAuthCommand {
  constructor(_input: any) {
    // stub
  }
}

export class RespondToAuthChallengeCommand {
  constructor(_input: any) {
    // stub
  }
}

export class GlobalSignOutCommand {
  constructor(_input: any) {
    // stub
  }
}

export class ChangePasswordCommand {
  constructor(_input: any) {
    // stub
  }
}

export class ForgotPasswordCommand {
  constructor(_input: any) {
    // stub
  }
}

export class ConfirmForgotPasswordCommand {
  constructor(_input: any) {
    // stub
  }
}

export class SignUpCommand {
  constructor(_input: any) {
    // stub
  }
}

export class ConfirmSignUpCommand {
  constructor(_input: any) {
    // stub
  }
}

export class ResendConfirmationCodeCommand {
  constructor(_input: any) {
    // stub
  }
}
