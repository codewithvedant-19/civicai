import type { IAuthorityIntegration, Issue, Authority, AuthorityRoutingResult } from "@/domain/types";

// SIMULATED PROVIDER — writes routing info onto the local issue record and
// returns a clearly-labeled "(simulated)" destination. No real government
// system is contacted. To integrate a real city's ticketing/311 API,
// implement IAuthorityIntegration in a new file (e.g. cityApiIntegration.ts)
// and switch it on in lib/registry.ts — nothing else in the app changes.
export class SimulatedAuthorityRouter implements IAuthorityIntegration {
  readonly name = "SimulatedAuthorityRouter (simulated)";

  async routeIssue(issue: Issue, authority: Authority): Promise<AuthorityRoutingResult> {
    return {
      routedTo: `${authority.name} (simulated)`,
      isSimulated: true,
      externalRef: `SIM-${issue.id.slice(0, 8).toUpperCase()}`,
    };
  }

  async pushStatusUpdate(): Promise<void> {
    // no-op: nothing to push to in the simulated flow
  }
}
