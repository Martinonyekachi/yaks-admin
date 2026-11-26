import { adminProfile } from './admin.js'
import { initialUserRecords } from './users.js'

export const projectStatuses = ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled']
export const projectPriorities = ['Low', 'Medium', 'High', 'Critical']
export const projectCategories = ['Design', 'Engineering', 'Marketing', 'Operations', 'Product', 'Infrastructure']
export const taskStatuses = ['To Do', 'In Progress', 'Review', 'Completed']

function dateOffset(offset) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function shiftDate(value, offset) {
  const date = new Date(`${value}T12:00:00`)
  date.setDate(date.getDate() + offset)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const activeUsers = initialUserRecords.filter((user) => user.status === 'Active')

export const projectTeamMembers = [
  { id: 'ADMIN', name: adminProfile.name, initials: adminProfile.initials, color: 'lavender' },
  ...activeUsers.map(({ id, name, initials, color }) => ({ id, name, initials, color })),
]

const taskPlans = {
  Design: [
    ['Discovery interviews', 'Interview users and document their main workflow needs.'],
    ['Information architecture', 'Map navigation and validate the content structure.'],
    ['Visual design system', 'Prepare reusable components and approved visual tokens.'],
    ['Design quality review', 'Review accessibility, responsive layouts and handoff notes.'],
  ],
  Engineering: [
    ['Technical discovery', 'Confirm system boundaries, dependencies and implementation risks.'],
    ['Core workflow implementation', 'Build the primary experience and connect its supporting services.'],
    ['Integration and regression tests', 'Verify key flows and resolve high-impact defects.'],
    ['Release readiness', 'Prepare deployment checks, monitoring and handover documentation.'],
  ],
  Marketing: [
    ['Audience research', 'Review audience segments, customer needs and channel insights.'],
    ['Campaign concept', 'Develop messaging, creative direction and campaign assets.'],
    ['Channel rollout', 'Coordinate launch activities across the selected channels.'],
    ['Campaign performance review', 'Measure results and document recommendations for the next cycle.'],
  ],
  Operations: [
    ['Workflow assessment', 'Map the current process and identify operational bottlenecks.'],
    ['Service standards', 'Agree on ownership, response targets and escalation paths.'],
    ['Team enablement', 'Prepare guidance and onboard the teams responsible for delivery.'],
    ['Operational review', 'Review outcomes and confirm follow-up improvements.'],
  ],
  Product: [
    ['Customer problem framing', 'Synthesize feedback and define the problem to solve.'],
    ['Product requirements', 'Document scope, acceptance criteria and success measures.'],
    ['Prototype validation', 'Test the proposed experience with representative users.'],
    ['Launch readiness review', 'Confirm release scope, communication and support needs.'],
  ],
  Infrastructure: [
    ['Environment assessment', 'Review infrastructure dependencies and resilience requirements.'],
    ['Provision and migrate', 'Set up the target environment and migrate approved workloads.'],
    ['Load and recovery testing', 'Validate performance, failover and recovery procedures.'],
    ['Operations handover', 'Document runbooks, monitoring and ownership responsibilities.'],
  ],
}

export function createProjectTasks({ id, category, dueDate, teamMemberIds, priority, progress = 0, status = 'Planning' }) {
  const completedTasks = Math.round(progress / 25)
  return taskPlans[category].map(([title, description], index) => ({
    id: `${id}-T${index + 1}`,
    title,
    description,
    assigneeId: teamMemberIds[index % teamMemberIds.length],
    priority: index === 0 ? priority : projectPriorities[(index + id.length) % projectPriorities.length],
    dueDate: shiftDate(dueDate, -(3 - index) * 3),
    status: index < completedTasks
      ? 'Completed'
      : index === completedTasks && status === 'In Progress'
        ? 'In Progress'
        : 'To Do',
  }))
}

function buildProject(seed) {
  const dueDate = dateOffset(seed.dueInDays)
  const tasks = createProjectTasks({
    id: seed.id,
    category: seed.category,
    dueDate,
    teamMemberIds: seed.teamMemberIds,
    priority: seed.priority,
    progress: seed.progress,
    status: seed.status,
  })

  return {
    id: seed.id,
    name: seed.name,
    description: seed.description,
    category: seed.category,
    managerId: seed.managerId,
    teamMemberIds: seed.teamMemberIds,
    startDate: dateOffset(-seed.startedDaysAgo),
    dueDate,
    dueInDays: seed.dueInDays,
    budget: seed.budget,
    progress: seed.progress,
    priority: seed.priority,
    status: seed.status,
    color: seed.color,
    tasks,
    milestones: seed.milestones.map((title, index) => ({
      id: `${seed.id}-M${index + 1}`,
      title,
      dueDate: shiftDate(dueDate, -(seed.milestones.length - index - 1) * 10),
      status: index < Math.round(seed.progress / 25)
        ? 'Completed'
        : index === Math.round(seed.progress / 25) && seed.status === 'In Progress'
          ? 'In Progress'
          : 'Upcoming',
    })),
    activity: seed.activity,
  }
}

const projectSeeds = [
  { id: 'PRJ-2401', name: 'Mobile App Redesign', description: 'Refresh the mobile experience with clearer navigation and a faster path to key account actions.', category: 'Design', managerId: 'YKS-01026', teamMemberIds: ['YKS-01027', 'YKS-01028', 'YKS-01030'], startedDaysAgo: 48, dueInDays: 21, budget: 8400000, progress: 50, priority: 'Critical', status: 'In Progress', color: 'blue', milestones: ['Research synthesis approved', 'Core flows signed off', 'Visual system delivered', 'Engineering handoff'], activity: [{ title: 'Wireframe review completed', detail: 'The product team approved the core account flows.', time: '2 hours ago' }, { title: 'Research findings added', detail: 'Customer interview notes are ready for review.', time: 'Yesterday' }] },
  { id: 'PRJ-2402', name: 'Q4 Growth Campaign', description: 'Coordinate a multi-channel campaign to grow qualified workspace sign-ups through the end of the quarter.', category: 'Marketing', managerId: 'YKS-01028', teamMemberIds: ['YKS-01025', 'YKS-01027', 'YKS-01030'], startedDaysAgo: 35, dueInDays: 38, budget: 12600000, progress: 25, priority: 'High', status: 'In Progress', color: 'violet', milestones: ['Audience segments confirmed', 'Campaign concept approved', 'Channel rollout', 'Performance review'], activity: [{ title: 'Campaign brief updated', detail: 'The launch brief now includes the approved audience segments.', time: '4 hours ago' }] },
  { id: 'PRJ-2403', name: 'Brand Refresh', description: 'Update the visual identity and brand guidance across customer-facing product and marketing touchpoints.', category: 'Design', managerId: 'ADMIN', teamMemberIds: ['YKS-01026', 'YKS-01028', 'YKS-01030'], startedDaysAgo: 96, dueInDays: -10, budget: 5600000, progress: 100, priority: 'Medium', status: 'Completed', color: 'green', milestones: ['Brand audit completed', 'Identity approved', 'Guidelines published', 'Asset handoff'], activity: [{ title: 'Brand guidelines published', detail: 'The final brand system is now available to the workspace.', time: '2 days ago' }] },
  { id: 'PRJ-2404', name: 'Customer Portal', description: 'Plan a secure self-service portal where customers can manage subscriptions, invoices and support requests.', category: 'Product', managerId: 'YKS-01025', teamMemberIds: ['YKS-01026', 'YKS-01027', 'YKS-01030'], startedDaysAgo: 12, dueInDays: 65, budget: 18400000, progress: 0, priority: 'Low', status: 'Planning', color: 'amber', milestones: ['Problem framing', 'Requirements sign-off', 'Prototype validation', 'Delivery plan'], activity: [{ title: 'Planning workspace created', detail: 'Initial stakeholders and discovery scope were added.', time: 'Today' }] },
  { id: 'PRJ-2405', name: 'Data Quality Initiative', description: 'Improve reporting confidence by standardizing data definitions and resolving high-impact quality issues.', category: 'Operations', managerId: 'YKS-01030', teamMemberIds: ['YKS-01025', 'YKS-01026', 'YKS-01028'], startedDaysAgo: 70, dueInDays: 4, budget: 7300000, progress: 50, priority: 'High', status: 'On Hold', color: 'amber', milestones: ['Quality audit', 'Definitions agreed', 'Remediation complete', 'Controls documented'], activity: [{ title: 'Delivery paused', detail: 'Work is on hold pending data owner confirmation.', time: '3 days ago' }] },
  { id: 'PRJ-2406', name: 'Analytics Migration', description: 'Move workspace reporting to a maintainable analytics platform with validated dashboards and access controls.', category: 'Engineering', managerId: 'YKS-01026', teamMemberIds: ['YKS-01025', 'YKS-01027', 'YKS-01030'], startedDaysAgo: 82, dueInDays: -6, budget: 22100000, progress: 75, priority: 'Critical', status: 'In Progress', color: 'blue', milestones: ['Platform selected', 'Data model migrated', 'Dashboards validated', 'Legacy reports retired'], activity: [{ title: 'Dashboard validation started', detail: 'Finance and operations are reviewing migrated metrics.', time: '5 hours ago' }] },
  { id: 'PRJ-2407', name: 'Operations Playbook', description: 'Document core operating procedures, escalation paths and onboarding guidance for distributed teams.', category: 'Operations', managerId: 'ADMIN', teamMemberIds: ['YKS-01025', 'YKS-01028', 'YKS-01030'], startedDaysAgo: 120, dueInDays: -25, budget: 2900000, progress: 100, priority: 'Low', status: 'Completed', color: 'green', milestones: ['Process inventory', 'Procedure review', 'Playbook published', 'Team walkthrough'], activity: [{ title: 'Team walkthrough finished', detail: 'Department leads completed the playbook review.', time: '1 week ago' }] },
  { id: 'PRJ-2408', name: 'Mobile Payments', description: 'Introduce a reliable mobile checkout flow with clear payment status and recovery guidance.', category: 'Engineering', managerId: 'YKS-01024', teamMemberIds: ['YKS-01025', 'YKS-01027', 'YKS-01030'], startedDaysAgo: 55, dueInDays: 12, budget: 15700000, progress: 50, priority: 'High', status: 'In Progress', color: 'violet', milestones: ['Payment flow designed', 'Gateway integration', 'End-to-end testing', 'Rollout'], activity: [{ title: 'Payment flow review', detail: 'The team reviewed payment recovery and retry behavior.', time: 'Yesterday' }] },
  { id: 'PRJ-2409', name: 'Legacy Billing Cleanup', description: 'Retire duplicate billing workflows and consolidate customer records before the next renewal cycle.', category: 'Operations', managerId: 'YKS-01030', teamMemberIds: ['YKS-01025', 'YKS-01026', 'YKS-01028'], startedDaysAgo: 44, dueInDays: -8, budget: 4100000, progress: 25, priority: 'Medium', status: 'Cancelled', color: 'slate', milestones: ['Workflow inventory', 'Data mapping', 'Migration rehearsal', 'Closeout'], activity: [{ title: 'Project cancelled', detail: 'Scope was consolidated into the billing platform roadmap.', time: '4 days ago' }] },
  { id: 'PRJ-2410', name: 'Partner API v2', description: 'Ship a versioned partner API with predictable authentication, pagination and operational guidance.', category: 'Engineering', managerId: 'YKS-01025', teamMemberIds: ['YKS-01026', 'YKS-01027', 'YKS-01030'], startedDaysAgo: 105, dueInDays: -18, budget: 19300000, progress: 50, priority: 'High', status: 'In Progress', color: 'blue', milestones: ['API contract reviewed', 'Authentication shipped', 'Partner testing', 'Version 2 release'], activity: [{ title: 'Partner testing scheduled', detail: 'Two integration partners confirmed their test window.', time: '2 days ago' }] },
  { id: 'PRJ-2411', name: 'Employee Onboarding', description: 'Create a consistent onboarding journey with clear access, learning and first-week checkpoints.', category: 'Product', managerId: 'ADMIN', teamMemberIds: ['YKS-01026', 'YKS-01028', 'YKS-01030'], startedDaysAgo: 8, dueInDays: 80, budget: 3500000, progress: 0, priority: 'Low', status: 'Planning', color: 'amber', milestones: ['Current journey mapped', 'Content plan approved', 'Pilot cohort', 'Launch review'], activity: [{ title: 'Kickoff scheduled', detail: 'People operations and team leads are preparing discovery.', time: 'Today' }] },
  { id: 'PRJ-2412', name: 'Cloud Cost Optimization', description: 'Reduce cloud operating costs while preserving service reliability and delivery performance.', category: 'Infrastructure', managerId: 'YKS-01024', teamMemberIds: ['YKS-01025', 'YKS-01026', 'YKS-01027'], startedDaysAgo: 94, dueInDays: -32, budget: 11800000, progress: 75, priority: 'Medium', status: 'In Progress', color: 'violet', milestones: ['Usage baseline', 'Savings plan approved', 'Changes applied', 'Reliability review'], activity: [{ title: 'Savings review shared', detail: 'The team identified three infrastructure changes for approval.', time: '6 hours ago' }] },
  { id: 'PRJ-2413', name: 'Accessibility Improvements', description: 'Raise accessibility across core account and workspace flows through audits, fixes and repeatable checks.', category: 'Design', managerId: 'YKS-01026', teamMemberIds: ['YKS-01027', 'YKS-01028', 'YKS-01030'], startedDaysAgo: 115, dueInDays: -60, budget: 6200000, progress: 100, priority: 'High', status: 'Completed', color: 'green', milestones: ['Audit complete', 'Critical fixes shipped', 'Assistive technology review', 'Accessibility report'], activity: [{ title: 'Accessibility review signed off', detail: 'All planned priority fixes passed the final review.', time: '2 weeks ago' }] },
  { id: 'PRJ-2414', name: 'Service Desk Upgrade', description: 'Modernize internal service desk intake, ownership and reporting for faster resolution times.', category: 'Operations', managerId: 'YKS-01025', teamMemberIds: ['YKS-01026', 'YKS-01028', 'YKS-01030'], startedDaysAgo: 28, dueInDays: 16, budget: 9100000, progress: 25, priority: 'Medium', status: 'On Hold', color: 'amber', milestones: ['Intake mapped', 'Tool configuration', 'Pilot support teams', 'Operational handoff'], activity: [{ title: 'Configuration paused', detail: 'The team is waiting on final service desk access approvals.', time: 'Yesterday' }] },
]

export const initialProjects = projectSeeds.map(buildProject)

export const formatProjectDate = (value) => new Intl.DateTimeFormat('en-NG', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}).format(new Date(`${value}T12:00:00`))
