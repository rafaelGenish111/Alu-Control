## Sub-Agent Orchestration Rules
The main session acts as the Orchestrator. Delegate tasks effectively:

- **Parallel Dispatch**: If tasks are independent (e.g., "Write tests for module X" AND "Audit module Y for security"), run them in parallel.
- **Sequential Dispatch**: If tasks act on the same files or have dependencies (e.g., "Implement feature" THEN "Test it"), run them sequentially.
- **Role Assignment**:
  - Use `backend-developer` for implementation.
  - Use `qa-tester` for running/writing tests.
  - Use `security-auditor` for code review.

## Multi-Agent Protocol & Logging
This project uses `MULTI_AGENT_PLAN.md` as the source of truth.

**Rules for the Orchestrator:**
1. **Pre-Flight Check:** Before starting any complex task or spawning agents, READ `MULTI_AGENT_PLAN.md` to understand the current state.
2. **Mandatory Instruction:** When you invoke a subagent (Developer, Tester, etc.), you MUST append the following instruction to their prompt:
   > "Update `MULTI_AGENT_PLAN.md`: Mark your task as [IN-PROGRESS] when you start, and [DONE] when you finish. Log your key output in the 'Notes' column."
3. **Verification:** If a subagent returns without confirming they updated the plan, ask them to go back and update it.