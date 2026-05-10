# Homework 8 — Engineering Management: Leadership (Patterns)

## Negative Patterns (Antipatterns)

### 1. Treating Your Team Like Children

Micromanaging every decision, requiring approval for trivial actions, and not trusting engineers to own their work signals a fundamental lack of respect for the team's competence. It directly kills the **autonomy** that drives intrinsic motivation.

**How I would address this in my project:**
In a student/team project context, this manifests as one person making all architectural decisions and assigning tasks down to the hour. Instead, I would assign each team member ownership of a module or feature end-to-end — they decide the approach, they open the PR, they present it. My role becomes reviewer and sounding board, not dictator. If someone makes a suboptimal choice, I discuss it after the fact rather than intercepting it beforehand. The cost of a bad local decision is almost always lower than the cost of a disempowered team.

### 2. Ignoring Low Performers

Letting a teammate underperform without addressing it is unfair to everyone: the team carries extra load, the low performer gets no signal they need to improve, and the issue compounds over time.

**How I would address this in my project:**
I would adopt a lightweight version of the "up-and-out" model early. As soon as I notice a pattern (missed deadlines, incomplete work, no initiative), I would have a direct one-on-one conversation — not a blame session, but a concrete check-in: "Here is what I expected, here is what happened, what's blocking you?" I would then set a short improvement window (e.g., two sprints) with specific, measurable goals (e.g., "deliver the authentication module with passing tests by sprint 4"). Weekly syncs keep it honest. This is respectful: it gives the person a real chance to course-correct rather than surprising them at the end of the project.

### 3. Compromising the Hiring Bar

In a project setting this translates to accepting any volunteer or group member without assessing fit, then assigning them critical work regardless of skill or commitment.

**How I would address this in my project:**
Before forming or accepting team members, I would have a brief structured conversation about availability, strengths, and interest areas. This is not gatekeeping — it is alignment. Based on that, I would assign roles to match actual capability and motivation, and keep critical-path work with the most reliable contributors. A person who is interested but inexperienced gets a well-scoped, lower-risk task with mentoring, not a core dependency.

---

## Positive Patterns

### 1. Set Clear Goals

Vague goals ("make the app good") lead to wasted effort, misaligned work, and frustration. Clear goals give the team a shared target and make progress visible.

**How I would implement this in my project:**
At the start of each sprint or phase I would write down 3–5 concrete deliverables in a shared document — not "work on the backend" but "implement POST /users endpoint with input validation and a passing integration test." Each item has an owner and a done-condition. This takes 20 minutes but eliminates an enormous amount of ambiguity and duplicated work throughout the sprint.

### 2. Remove Roadblocks

Blockers that sit unresolved kill momentum and signal to the team that management is decorative. A manager's most concrete value-add is often clearing the path.

**How I would implement this in my project:**
I would make it a standing question in every sync: "What is slowing you down?" Then I would treat the answer as the most urgent item on my list. If a teammate is stuck waiting for an API spec, I write the draft. If two people are blocked on a merge conflict in shared code, I facilitate a 15-minute session to resolve it. If someone doesn't have access to a tool, I get them access that day. The key is following through fast — if blockers are reported but nothing changes, people stop reporting them.

### 3. Be a Teacher and a Mentor

Teams grow when knowledge flows. Hoarding expertise or assuming "everyone should already know this" creates bottlenecks and leaves junior members behind.

**How I would implement this in my project:**
I would build teaching into normal workflow rather than scheduling separate sessions. Code review is the main vehicle: instead of just approving or rejecting a PR, I leave comments that explain *why* — linking to documentation, naming the pattern, suggesting an alternative with reasoning. For bigger knowledge gaps I would do a short pair-programming session. I would also encourage the team to take turns presenting a technical topic for 5–10 minutes at the start of a meeting, which builds both skill and communication confidence.

---

## Additional Positive Pattern: Foster Psychological Safety

Not covered in the lecture, but foundational: people will not raise problems, admit mistakes, or propose bold ideas if they fear being judged or blamed.

**How I would implement this in my project:**
I would normalize "I don't know" and "I was wrong" by saying both myself when they are true. When something goes wrong I would run a blameless post-mortem — the question is always "what in the process failed?" not "who failed?" I would also make sure that quieter team members' ideas get airtime, either by explicitly asking them during discussions or by using async channels (a shared doc, a group chat) where people can contribute without the social pressure of speaking up live.
