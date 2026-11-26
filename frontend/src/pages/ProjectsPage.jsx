import { useMemo, useState } from 'react'
import {
  ArrowDownUp, ArrowLeft, ArrowRight, ArrowUpDown, CalendarDays, Check, ChevronLeft,
  ChevronRight, CircleDollarSign, Clock3, Edit3, Eye, Flag, FolderKanban, LayoutGrid,
  Filter, List, Plus, Search, Trash2,
} from 'lucide-react'
import { Avatar, EmptyState, Modal, PageHeading, PanelHeading, StatusBadge } from '../components/UI.jsx'
import { useToast } from '../components/toast-context.js'
import { formatNaira } from '../data/dashboard.js'
import {
  createProjectTasks, formatProjectDate, initialProjects, projectCategories, projectPriorities,
  projectStatuses, projectTeamMembers, taskStatuses,
} from '../data/projects.js'

function toLocalDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date, amount) {
  const result = new Date(date)
  result.setDate(result.getDate() + amount)
  return toLocalDate(result)
}

function createProjectForm(today) {
  return {
    name: '',
    description: '',
    category: 'Product',
    managerId: 'ADMIN',
    teamMemberIds: projectTeamMembers.slice(1, 4).map((member) => member.id),
    startDate: toLocalDate(today),
    dueDate: addDays(today, 30),
    budget: '',
    priority: 'Medium',
    status: 'Planning',
  }
}

function getProjectProgress(tasks) {
  if (!tasks.length) return 0
  return Math.round((tasks.filter((task) => task.status === 'Completed').length / tasks.length) * 100)
}

function syncProjectTasks(project, tasks, activityDetail) {
  const progress = getProjectProgress(tasks)
  let status = project.status
  if (status !== 'Cancelled') {
    if (progress === 100) status = 'Completed'
    else if (status === 'Planning' || status === 'Completed') status = 'In Progress'
  }
  return {
    ...project,
    tasks,
    progress,
    status,
    activity: [{ title: 'Task board updated', detail: activityDetail, time: 'Just now' }, ...project.activity],
  }
}

function PriorityBadge({ priority }) {
  return <span className={`priority-badge priority-${priority.toLowerCase()}`}><i />{priority}</span>
}

function ProjectStat({ label, value, note, icon: Icon, tone }) {
  return (
    <article className="panel project-stat-card">
      <div className="project-stat-heading"><span>{label}</span><span className={`metric-icon metric-${tone}`}><Icon size={17} /></span></div>
      <strong>{value.toLocaleString()}</strong>
      <small>{note}</small>
    </article>
  )
}

function ProjectForm({ values, errors, onChange, onTeamToggle, onSubmit, editing }) {
  return (
    <form id="project-form" className="form-stack project-form" noValidate onSubmit={onSubmit}>
      <div className="project-form-grid">
        <label className="form-wide">Project name
          <input name="name" value={values.name} onChange={onChange} aria-invalid={Boolean(errors.name)} placeholder="e.g. Customer onboarding refresh" />
          {errors.name && <small className="field-error">{errors.name}</small>}
        </label>
        <label className="form-wide">Description
          <textarea name="description" rows="3" value={values.description} onChange={onChange} aria-invalid={Boolean(errors.description)} placeholder="What outcome will this project deliver?" />
          {errors.description && <small className="field-error">{errors.description}</small>}
        </label>
        <label>Category
          <select name="category" value={values.category} onChange={onChange}>{projectCategories.map((category) => <option key={category}>{category}</option>)}</select>
        </label>
        <label>Project manager
          <select name="managerId" value={values.managerId} onChange={onChange}>{projectTeamMembers.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select>
          {errors.managerId && <small className="field-error">{errors.managerId}</small>}
        </label>
        <label>Start date
          <input name="startDate" type="date" value={values.startDate} onChange={onChange} aria-invalid={Boolean(errors.startDate)} />
          {errors.startDate && <small className="field-error">{errors.startDate}</small>}
        </label>
        <label>Due date
          <input name="dueDate" type="date" value={values.dueDate} onChange={onChange} aria-invalid={Boolean(errors.dueDate)} />
          {errors.dueDate && <small className="field-error">{errors.dueDate}</small>}
        </label>
        <label>Budget (₦)
          <input name="budget" type="number" min="1" step="1000" value={values.budget} onChange={onChange} aria-invalid={Boolean(errors.budget)} placeholder="e.g. 2500000" />
          {errors.budget && <small className="field-error">{errors.budget}</small>}
        </label>
        <label>Priority
          <select name="priority" value={values.priority} onChange={onChange}>{projectPriorities.map((priority) => <option key={priority}>{priority}</option>)}</select>
        </label>
        <label>Initial status
          <select name="status" value={values.status} onChange={onChange}>{projectStatuses.map((status) => <option key={status}>{status}</option>)}</select>
        </label>
      </div>
      <fieldset className="project-team-fieldset">
        <legend>Assigned team members</legend>
        <div className="project-team-options">{projectTeamMembers.map((member) => <label key={member.id}><input type="checkbox" checked={values.teamMemberIds.includes(member.id)} onChange={() => onTeamToggle(member.id)} /><Avatar initials={member.initials} color={member.color} size="small" /><span>{member.name}</span></label>)}</div>
        {errors.teamMemberIds && <small className="field-error">{errors.teamMemberIds}</small>}
      </fieldset>
      <p className="project-form-note">{editing ? 'Updates are applied to this local sample project.' : 'The project will be added to this local workspace preview.'}</p>
    </form>
  )
}

function TaskForm({ values, errors, onChange, onSubmit, members, editing }) {
  return (
    <form id="task-form" className="form-stack project-form" noValidate onSubmit={onSubmit}>
      <div className="project-form-grid">
        <label className="form-wide">Task title
          <input name="title" value={values.title} onChange={onChange} aria-invalid={Boolean(errors.title)} placeholder="e.g. Review customer journey" />
          {errors.title && <small className="field-error">{errors.title}</small>}
        </label>
        <label className="form-wide">Description
          <textarea name="description" rows="3" value={values.description} onChange={onChange} aria-invalid={Boolean(errors.description)} placeholder="Describe the expected outcome." />
          {errors.description && <small className="field-error">{errors.description}</small>}
        </label>
        <label>Assigned member
          <select name="assigneeId" value={values.assigneeId} onChange={onChange}>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select>
        </label>
        <label>Priority
          <select name="priority" value={values.priority} onChange={onChange}>{projectPriorities.map((priority) => <option key={priority}>{priority}</option>)}</select>
        </label>
        <label>Due date
          <input name="dueDate" type="date" value={values.dueDate} onChange={onChange} aria-invalid={Boolean(errors.dueDate)} />
          {errors.dueDate && <small className="field-error">{errors.dueDate}</small>}
        </label>
        <label>Status
          <select name="status" value={values.status} onChange={onChange}>{taskStatuses.map((status) => <option key={status}>{status}</option>)}</select>
        </label>
      </div>
      <p className="project-form-note">{editing ? 'Task changes update project progress.' : 'Task updates are stored in this local project preview.'}</p>
    </form>
  )
}

function ProjectCard({ project, manager, members, onOpen, onEdit, onDelete }) {
  const team = project.teamMemberIds.map((id) => members.find((member) => member.id === id)).filter(Boolean)
  return (
    <article className="project-card">
      <div className="project-card-top">
        <span className={`project-mark mark-${project.color}`}><FolderKanban size={16} /></span>
        <span className="project-category">{project.category}</span>
        <PriorityBadge priority={project.priority} />
      </div>
      <button className="project-card-title" onClick={onOpen}>{project.name}<ArrowRight size={15} /></button>
      <p className="project-card-description">{project.description}</p>
      <div className="project-card-owner">
        <Avatar initials={manager?.initials ?? '—'} color={manager?.color ?? 'blue'} size="small" />
        <span><small>Project manager</small><strong>{manager?.name ?? 'Unassigned'}</strong></span>
      </div>
      <div className="project-card-team">
        <span>Team <strong>{team.length}</strong></span>
        <div className="project-avatar-stack">{team.slice(0, 4).map((member) => <span key={member.id} title={member.name}><Avatar initials={member.initials} color={member.color} size="small" /></span>)}{team.length > 4 && <span className="project-avatar-overflow">+{team.length - 4}</span>}</div>
      </div>
      <div className="project-card-progress">
        <div><span>Progress</span><strong>{project.progress}%</strong></div>
        <div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div>
      </div>
      <div className="project-card-footer">
        <span><CalendarDays size={13} />Due {formatProjectDate(project.dueDate)}</span>
        <StatusBadge>{project.status}</StatusBadge>
      </div>
      <div className="project-card-actions">
        <button className="button button-quiet" onClick={onOpen}><Eye size={14} />Details</button>
        <button className="icon-button" aria-label={`Edit ${project.name}`} title="Edit project" onClick={onEdit}><Edit3 size={15} /></button>
        <button className="icon-button project-delete-button" aria-label={`Delete ${project.name}`} title="Delete project" onClick={onDelete}><Trash2 size={15} /></button>
      </div>
    </article>
  )
}

function ProjectDetails({ project, members, today, onBack, onEdit, onDelete, onAddTask, onEditTask, onMoveTask }) {
  const manager = members.find((member) => member.id === project.managerId)
  const team = project.teamMemberIds.map((id) => members.find((member) => member.id === id)).filter(Boolean)
  const completedTasks = project.tasks.filter((task) => task.status === 'Completed').length
  const inProgressTasks = project.tasks.filter((task) => task.status === 'In Progress').length
  const overdueTasks = project.tasks.filter((task) => task.dueDate < toLocalDate(today) && task.status !== 'Completed').length

  return (
    <div className="workspace-page project-detail-page">
      <PageHeading
        eyebrow={`PROJECTS / ${project.id}`}
        title={project.name}
        description={project.description}
        actions={<><button className="button button-secondary" onClick={onBack}><ArrowLeft size={15} />All projects</button><button className="button button-secondary" onClick={onEdit}><Edit3 size={14} />Edit project</button><button className="button button-danger" onClick={onDelete}><Trash2 size={14} />Delete</button></>}
      />
      <div className="project-detail-statusline"><StatusBadge>{project.status}</StatusBadge><PriorityBadge priority={project.priority} /><span>{project.category}</span><span>{project.id}</span></div>

      <div className="project-detail-stats">
        <ProjectStat label="Completion" value={`${project.progress}%`} note="Based on completed tasks" icon={Check} tone="blue" />
        <ProjectStat label="Task progress" value={`${completedTasks}/${project.tasks.length}`} note={`${inProgressTasks} currently in progress`} icon={List} tone="green" />
        <ProjectStat label="Project budget" value={formatNaira(project.budget)} note="Approved project allocation" icon={CircleDollarSign} tone="violet" />
        <ProjectStat label="Overdue tasks" value={overdueTasks} note="Tasks past their due date" icon={Clock3} tone={overdueTasks ? 'amber' : 'green'} />
      </div>

      <div className="project-detail-grid">
        <section className="panel project-overview-panel">
          <PanelHeading title="Project overview" subtitle="Ownership, schedule and delivery details" />
          <div className="project-meta-grid">
            <div><span>Project manager</span><strong className="project-manager-detail"><Avatar initials={manager?.initials ?? '—'} color={manager?.color ?? 'blue'} size="small" />{manager?.name ?? 'Unassigned'}</strong></div>
            <div><span>Category</span><strong>{project.category}</strong></div>
            <div><span>Start date</span><strong>{formatProjectDate(project.startDate)}</strong></div>
            <div><span>Due date</span><strong>{formatProjectDate(project.dueDate)}</strong></div>
            <div><span>Budget</span><strong>{formatNaira(project.budget)}</strong></div>
            <div><span>Priority</span><strong><PriorityBadge priority={project.priority} /></strong></div>
          </div>
          <div className="project-team-detail">
            <h3>Assigned team <span>{team.length} members</span></h3>
            <div>{team.map((member) => <span key={member.id}><Avatar initials={member.initials} color={member.color} size="small" />{member.name}</span>)}</div>
          </div>
          <div className="project-progress-detail"><div><strong>Overall completion</strong><span>{project.progress}%</span></div><div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div></div>
        </section>

        <section className="panel project-milestones-panel">
          <PanelHeading title="Milestones" subtitle="Key delivery checkpoints" />
          {project.milestones.length ? <ol className="milestone-list">{project.milestones.map((milestone) => <li key={milestone.id} className={`milestone-${milestone.status.toLowerCase().replace(/\s+/g, '-')}`}><span className="milestone-marker">{milestone.status === 'Completed' ? <Check size={12} /> : null}</span><span><strong>{milestone.title}</strong><small>{formatProjectDate(milestone.dueDate)}</small></span><em>{milestone.status}</em></li>)}</ol> : <EmptyState title="No milestones yet" description="Milestones will appear as the project plan takes shape." />}
        </section>
      </div>

      <div className="project-detail-grid project-detail-lower">
        <section className="panel project-activity-panel">
          <PanelHeading title="Recent activity" subtitle="Latest project updates" />
          {project.activity.length ? <ul className="project-activity-list">{project.activity.map((item, index) => <li key={`${item.title}-${index}`}><span className="project-activity-icon"><Check size={13} /></span><span><strong>{item.title}</strong><small>{item.detail}</small></span><time>{item.time}</time></li>)}</ul> : <EmptyState title="No recent activity" description="Project updates will appear here." />}
        </section>
        <section className="panel project-task-summary">
          <PanelHeading title="Task summary" subtitle="Work tracked on the project board" />
          <div className="task-summary-counts"><div><strong>{project.tasks.length}</strong><span>Total tasks</span></div><div><strong>{inProgressTasks}</strong><span>In progress</span></div><div><strong>{completedTasks}</strong><span>Completed</span></div></div>
          <div className="project-progress-detail"><div><strong>Task completion</strong><span>{project.progress}%</span></div><div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div></div>
        </section>
      </div>

      <section className="panel kanban-panel">
        <div className="kanban-heading"><PanelHeading title="Project tasks" subtitle="Move work through the delivery stages" /><button className="button button-primary" onClick={onAddTask}><Plus size={15} />Add task</button></div>
        <div className="kanban-board">{taskStatuses.map((status) => {
          const tasks = project.tasks.filter((task) => task.status === status)
          return <section className={`kanban-column kanban-${status.toLowerCase().replace(/\s+/g, '-')}`} key={status}>
            <header><span><i />{status}</span><strong>{tasks.length}</strong></header>
            <div className="kanban-cards">{tasks.map((task) => {
              const assignee = members.find((member) => member.id === task.assigneeId)
              return <article className="task-card" key={task.id}>
                <div className="task-card-meta"><PriorityBadge priority={task.priority} /><button className="icon-button" aria-label={`Edit task ${task.title}`} title="Edit task" onClick={() => onEditTask(task)}><Edit3 size={14} /></button></div>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <div className="task-card-assignee"><Avatar initials={assignee?.initials ?? '—'} color={assignee?.color ?? 'blue'} size="small" /><span>{assignee?.name ?? 'Unassigned'}</span></div>
                <div className="task-card-footer"><span><CalendarDays size={12} />{formatProjectDate(task.dueDate)}</span><label><span className="visually-hidden">Move {task.title} to status</span><select aria-label={`Move ${task.title} to status`} value={task.status} onChange={(event) => onMoveTask(task.id, event.target.value)}>{taskStatuses.map((option) => <option key={option}>{option}</option>)}</select></label></div>
              </article>
            })}{!tasks.length && <div className="kanban-empty">No tasks in this stage</div>}</div>
          </section>
        })}</div>
      </section>
    </div>
  )
}

export default function ProjectsPage() {
  const [rows, setRows] = useState(initialProjects)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [categoryFilter, setCategoryFilter] = useState('All categories')
  const [priorityFilter, setPriorityFilter] = useState('All priorities')
  const [dateFilter, setDateFilter] = useState('Any due date')
  const [sortBy, setSortBy] = useState('Due date')
  const [sortDirection, setSortDirection] = useState('asc')
  const [view, setView] = useState('grid')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [projectForm, setProjectForm] = useState(() => createProjectForm(new Date()))
  const [projectErrors, setProjectErrors] = useState({})
  const [deleteProjectId, setDeleteProjectId] = useState(null)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assigneeId: '', priority: 'Medium', dueDate: '', status: 'To Do' })
  const [taskErrors, setTaskErrors] = useState({})
  const [today] = useState(() => new Date())
  const notify = useToast()
  const selectedProject = rows.find((project) => project.id === selectedProjectId) ?? null
  const dateToday = toLocalDate(today)

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase()
    const next30 = addDays(today, 30)
    const next90 = addDays(today, 90)
    return rows.filter((project) => {
      const manager = projectTeamMembers.find((member) => member.id === project.managerId)
      const searchText = `${project.id} ${project.name} ${project.description} ${project.category} ${manager?.name ?? ''}`.toLowerCase()
      const overdue = project.dueDate < dateToday && !['Completed', 'Cancelled'].includes(project.status)
      const matchesDate = dateFilter === 'Any due date'
        || (dateFilter === 'Overdue' && overdue)
        || (dateFilter === 'Next 30 days' && project.dueDate >= dateToday && project.dueDate <= next30)
        || (dateFilter === 'Next 90 days' && project.dueDate >= dateToday && project.dueDate <= next90)
        || (dateFilter === 'This year' && project.dueDate.startsWith(String(today.getFullYear())))
      return (!query || searchText.includes(query))
        && (statusFilter === 'All statuses' || project.status === statusFilter)
        && (categoryFilter === 'All categories' || project.category === categoryFilter)
        && (priorityFilter === 'All priorities' || project.priority === priorityFilter)
        && matchesDate
    }).sort((a, b) => {
      let comparison = 0
      if (sortBy === 'Project name') comparison = a.name.localeCompare(b.name)
      else if (sortBy === 'Budget') comparison = a.budget - b.budget
      else if (sortBy === 'Progress') comparison = a.progress - b.progress
      else comparison = a.dueDate.localeCompare(b.dueDate)
      return comparison * (sortDirection === 'asc' ? 1 : -1)
    })
  }, [categoryFilter, dateFilter, dateToday, priorityFilter, rows, search, sortBy, sortDirection, statusFilter, today])

  const pageCount = Math.max(1, Math.ceil(filteredProjects.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visibleProjects = filteredProjects.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const overdueCount = rows.filter((project) => project.dueDate < dateToday && !['Completed', 'Cancelled'].includes(project.status)).length
  const activeCount = rows.filter((project) => project.status === 'In Progress').length
  const completedCount = rows.filter((project) => project.status === 'Completed').length

  function changeFilter(setter, value) {
    setter(value)
    setPage(1)
  }

  function openCreateProject() {
    setEditingProjectId(null)
    setProjectForm(createProjectForm(today))
    setProjectErrors({})
    setProjectModalOpen(true)
  }

  function openEditProject(project) {
    setEditingProjectId(project.id)
    setProjectForm({
      name: project.name,
      description: project.description,
      category: project.category,
      managerId: project.managerId,
      teamMemberIds: project.teamMemberIds,
      startDate: project.startDate,
      dueDate: project.dueDate,
      budget: String(project.budget),
      priority: project.priority,
      status: project.status,
    })
    setProjectErrors({})
    setProjectModalOpen(true)
  }

  function updateProjectForm(event) {
    const { name, value } = event.target
    setProjectForm((current) => ({ ...current, [name]: value }))
    setProjectErrors((current) => ({ ...current, [name]: '' }))
  }

  function toggleProjectTeam(memberId) {
    setProjectForm((current) => ({
      ...current,
      teamMemberIds: current.teamMemberIds.includes(memberId)
        ? current.teamMemberIds.filter((id) => id !== memberId)
        : [...current.teamMemberIds, memberId],
    }))
    setProjectErrors((current) => ({ ...current, teamMemberIds: '' }))
  }

  function submitProject(event) {
    event.preventDefault()
    const errors = {}
    const name = projectForm.name.trim()
    const description = projectForm.description.trim()
    const budget = Number(projectForm.budget)
    if (name.length < 3) errors.name = 'Enter a project name with at least 3 characters.'
    if (description.length < 15) errors.description = 'Add a description of at least 15 characters.'
    if (!projectTeamMembers.some((member) => member.id === projectForm.managerId)) errors.managerId = 'Select a project manager.'
    if (!projectForm.teamMemberIds.length) errors.teamMemberIds = 'Assign at least one team member.'
    if (!projectForm.startDate) errors.startDate = 'Choose a start date.'
    if (!projectForm.dueDate) errors.dueDate = 'Choose a due date.'
    if (projectForm.startDate && projectForm.dueDate && projectForm.dueDate < projectForm.startDate) errors.dueDate = 'Due date must be on or after the start date.'
    if (!Number.isFinite(budget) || budget <= 0) errors.budget = 'Enter a budget greater than zero.'
    if (!projectCategories.includes(projectForm.category)) errors.category = 'Choose a valid category.'
    if (!projectPriorities.includes(projectForm.priority)) errors.priority = 'Choose a valid priority.'
    if (!projectStatuses.includes(projectForm.status)) errors.status = 'Choose a valid project status.'
    if (Object.keys(errors).length) {
      setProjectErrors(errors)
      return
    }

    if (editingProjectId) {
      setRows((current) => current.map((project) => {
        if (project.id !== editingProjectId) return project
        let tasks = project.tasks
        if (projectForm.status === 'Completed') tasks = tasks.map((task) => ({ ...task, status: 'Completed' }))
        else if (project.status === 'Completed' && tasks.length) tasks = tasks.map((task, index) => ({ ...task, status: index === tasks.length - 1 ? 'In Progress' : 'Completed' }))
        else if (projectForm.status === 'Planning') tasks = tasks.map((task) => ({ ...task, status: 'To Do' }))
        const progress = getProjectProgress(tasks)
        return {
          ...project,
          name,
          description,
          category: projectForm.category,
          managerId: projectForm.managerId,
          teamMemberIds: projectForm.teamMemberIds,
          startDate: projectForm.startDate,
          dueDate: projectForm.dueDate,
          budget,
          priority: projectForm.priority,
          status: projectForm.status,
          tasks,
          progress: projectForm.status === 'Completed' ? 100 : progress,
          activity: [{ title: 'Project details updated', detail: 'Project plan and ownership details were changed.', time: 'Just now' }, ...project.activity],
        }
      }))
      notify(`${name} updated`)
    } else {
      setRows((current) => {
        const nextId = Math.max(...current.map((project) => Number(project.id.split('-')[1]))) + 1
        const id = `PRJ-${String(nextId).padStart(4, '0')}`
        const progress = projectForm.status === 'Completed' ? 100 : 0
        const tasks = createProjectTasks({
          id,
          category: projectForm.category,
          dueDate: projectForm.dueDate,
          teamMemberIds: projectForm.teamMemberIds,
          priority: projectForm.priority,
          progress,
          status: projectForm.status,
        })
        const milestones = ['Kickoff and scope confirmed', 'Midpoint review', 'Delivery handoff'].map((title, index) => ({
          id: `${id}-M${index + 1}`,
          title,
          dueDate: index === 0 ? projectForm.startDate : index === 1 ? addDays(today, Math.max(1, Math.floor((new Date(`${projectForm.dueDate}T12:00:00`) - today) / 172800000))) : projectForm.dueDate,
          status: projectForm.status === 'Completed' ? 'Completed' : index === 0 && projectForm.status === 'In Progress' ? 'In Progress' : 'Upcoming',
        }))
        return [{
          id,
          name,
          description,
          category: projectForm.category,
          managerId: projectForm.managerId,
          teamMemberIds: projectForm.teamMemberIds,
          startDate: projectForm.startDate,
          dueDate: projectForm.dueDate,
          budget,
          progress,
          priority: projectForm.priority,
          status: projectForm.status,
          color: 'blue',
          tasks,
          milestones,
          activity: [{ title: 'Project created', detail: 'Project created in the local workspace preview.', time: 'Just now' }],
        }, ...current]
      })
      setSearch('')
      setStatusFilter('All statuses')
      setCategoryFilter('All categories')
      setPriorityFilter('All priorities')
      setDateFilter('Any due date')
      setPage(1)
      notify(`${name} added to projects`)
    }
    setProjectModalOpen(false)
  }

  function openCreateTask() {
    if (!selectedProject) return
    setEditingTaskId(null)
    setTaskForm({
      title: '',
      description: '',
      assigneeId: selectedProject.teamMemberIds[0] ?? '',
      priority: 'Medium',
      dueDate: selectedProject.dueDate,
      status: 'To Do',
    })
    setTaskErrors({})
    setTaskModalOpen(true)
  }

  function openEditTask(task) {
    setEditingTaskId(task.id)
    setTaskForm({ title: task.title, description: task.description, assigneeId: task.assigneeId, priority: task.priority, dueDate: task.dueDate, status: task.status })
    setTaskErrors({})
    setTaskModalOpen(true)
  }

  function updateTaskForm(event) {
    const { name, value } = event.target
    setTaskForm((current) => ({ ...current, [name]: value }))
    setTaskErrors((current) => ({ ...current, [name]: '' }))
  }

  function submitTask(event) {
    event.preventDefault()
    const errors = {}
    const title = taskForm.title.trim()
    const description = taskForm.description.trim()
    if (title.length < 3) errors.title = 'Enter a task title with at least 3 characters.'
    if (description.length < 8) errors.description = 'Add a short task description.'
    if (!taskForm.dueDate) errors.dueDate = 'Choose a due date.'
    if (!selectedProject?.teamMemberIds.includes(taskForm.assigneeId)) errors.assigneeId = 'Assign this task to a project team member.'
    if (!projectPriorities.includes(taskForm.priority)) errors.priority = 'Choose a valid priority.'
    if (!taskStatuses.includes(taskForm.status)) errors.status = 'Choose a valid task status.'
    if (Object.keys(errors).length) {
      setTaskErrors(errors)
      return
    }

    setRows((current) => current.map((project) => {
      if (project.id !== selectedProjectId) return project
      const task = { id: editingTaskId ?? `${project.id}-T${project.tasks.length + 1}`, title, description, assigneeId: taskForm.assigneeId, priority: taskForm.priority, dueDate: taskForm.dueDate, status: taskForm.status }
      const tasks = editingTaskId
        ? project.tasks.map((item) => item.id === editingTaskId ? task : item)
        : [...project.tasks, task]
      return syncProjectTasks(project, tasks, `${title} ${editingTaskId ? 'was updated' : 'was added'} on the task board.`)
    }))
    notify(`${title} ${editingTaskId ? 'updated' : 'added'}`)
    setTaskModalOpen(false)
  }

  function moveTask(taskId, status) {
    const task = selectedProject?.tasks.find((item) => item.id === taskId)
    if (!task || task.status === status) return
    setRows((current) => current.map((project) => project.id === selectedProjectId
      ? syncProjectTasks(project, project.tasks.map((item) => item.id === taskId ? { ...item, status } : item), `${task.title} moved to ${status}.`)
      : project))
    notify(`${task.title} moved to ${status}`)
  }

  function confirmDeleteProject() {
    const project = rows.find((item) => item.id === deleteProjectId)
    setRows((current) => current.filter((item) => item.id !== deleteProjectId))
    setDeleteProjectId(null)
    setSelectedProjectId(null)
    setPage(1)
    notify(`${project?.name ?? 'Project'} deleted from the local workspace`)
  }

  function toggleSort(field) {
    if (sortBy === field) setSortDirection((current) => current === 'asc' ? 'desc' : 'asc')
    else {
      setSortBy(field)
      setSortDirection(field === 'Project name' ? 'asc' : 'desc')
    }
  }

  if (selectedProject) {
    return <>
      <ProjectDetails
        project={selectedProject}
        members={projectTeamMembers}
        today={today}
        onBack={() => setSelectedProjectId(null)}
        onEdit={() => openEditProject(selectedProject)}
        onDelete={() => setDeleteProjectId(selectedProject.id)}
        onAddTask={openCreateTask}
        onEditTask={openEditTask}
        onMoveTask={moveTask}
      />
      {projectModalOpen && <Modal title="Edit project" description="Update project ownership, schedule and delivery details." className="project-modal" onClose={() => setProjectModalOpen(false)} footer={<><button className="button button-secondary" onClick={() => setProjectModalOpen(false)}>Cancel</button><button className="button button-primary" type="submit" form="project-form"><Check size={15} />Save changes</button></>}><ProjectForm values={projectForm} errors={projectErrors} onChange={updateProjectForm} onTeamToggle={toggleProjectTeam} onSubmit={submitProject} editing /></Modal>}
      {taskModalOpen && <Modal title={editingTaskId ? 'Edit task' : 'Create task'} description={`Manage work for ${selectedProject.name}.`} className="project-modal" onClose={() => setTaskModalOpen(false)} footer={<><button className="button button-secondary" onClick={() => setTaskModalOpen(false)}>Cancel</button><button className="button button-primary" type="submit" form="task-form"><Check size={15} />{editingTaskId ? 'Save task' : 'Add task'}</button></>}><TaskForm values={taskForm} errors={taskErrors} onChange={updateTaskForm} onSubmit={submitTask} members={projectTeamMembers.filter((member) => selectedProject.teamMemberIds.includes(member.id))} editing={Boolean(editingTaskId)} /></Modal>}
      {deleteProjectId && <Modal title="Delete project?" description="This removes the project and its task board from the local preview." onClose={() => setDeleteProjectId(null)} footer={<><button className="button button-secondary" onClick={() => setDeleteProjectId(null)}>Cancel</button><button className="button button-danger" onClick={confirmDeleteProject}><Trash2 size={14} />Delete project</button></>}><p className="delete-confirm-copy">This sample action is not connected to a backend and cannot be undone in this session.</p></Modal>}
    </>
  }

  return (
    <div className="workspace-page projects-page">
      <PageHeading
        eyebrow="WORKSPACE"
        title="Project Management"
        description="Plan, organize and monitor projects across your workspace."
        actions={<button className="button button-primary" onClick={openCreateProject}><Plus size={16} />Create project</button>}
      />

      <section className="project-stats" aria-label="Project statistics">
        <ProjectStat label="Total projects" value={rows.length} note="Across all categories" icon={FolderKanban} tone="blue" />
        <ProjectStat label="Active projects" value={activeCount} note="Currently in progress" icon={ArrowRight} tone="violet" />
        <ProjectStat label="Completed projects" value={completedCount} note="Successfully delivered" icon={Check} tone="green" />
        <ProjectStat label="Overdue projects" value={overdueCount} note="Past due and still open" icon={Clock3} tone="amber" />
      </section>

      <section className="panel project-directory">
        <div className="project-directory-heading">
          <div><h2>Project directory</h2><p>Sample workspace data · Changes are local to this session</p></div>
          <div className="project-view-switch" role="group" aria-label="Project display mode">
            <button aria-label="Grid view" aria-pressed={view === 'grid'} className={view === 'grid' ? 'selected' : ''} onClick={() => setView('grid')}><LayoutGrid size={15} />Grid</button>
            <button aria-label="Table view" aria-pressed={view === 'table'} className={view === 'table' ? 'selected' : ''} onClick={() => setView('table')}><List size={15} />Table</button>
          </div>
        </div>

        <div className="project-filter-bar">
          <label className="table-search project-search"><Search size={16} /><input aria-label="Search projects" placeholder="Search projects, managers..." value={search} onChange={(event) => changeFilter(setSearch, event.target.value)} /></label>
          <div className="project-filter-controls">
            <label className="select-wrap"><FolderKanban size={14} /><select aria-label="Filter projects by status" value={statusFilter} onChange={(event) => changeFilter(setStatusFilter, event.target.value)}><option>All statuses</option>{projectStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
            <label className="select-wrap"><Filter size={14} /><select aria-label="Filter projects by category" value={categoryFilter} onChange={(event) => changeFilter(setCategoryFilter, event.target.value)}><option>All categories</option>{projectCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
            <label className="select-wrap"><Flag size={14} /><select aria-label="Filter projects by priority" value={priorityFilter} onChange={(event) => changeFilter(setPriorityFilter, event.target.value)}><option>All priorities</option>{projectPriorities.map((priority) => <option key={priority}>{priority}</option>)}</select></label>
            <label className="select-wrap"><CalendarDays size={14} /><select aria-label="Filter projects by due date" value={dateFilter} onChange={(event) => changeFilter(setDateFilter, event.target.value)}><option>Any due date</option><option>Next 30 days</option><option>Next 90 days</option><option>Overdue</option><option>This year</option></select></label>
          </div>
        </div>

        <div className="project-results-bar">
          <span><strong>{filteredProjects.length}</strong> {filteredProjects.length === 1 ? 'project' : 'projects'} found</span>
          <div><label>Sort by<select aria-label="Sort projects" value={sortBy} onChange={(event) => { setSortBy(event.target.value); setPage(1) }}><option>Due date</option><option>Project name</option><option>Budget</option><option>Progress</option></select></label><button className="icon-button" aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`} title={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`} onClick={() => setSortDirection((current) => current === 'asc' ? 'desc' : 'asc')}>{sortDirection === 'asc' ? <ArrowDownUp size={15} /> : <ArrowUpDown size={15} />}</button></div>
        </div>

        {view === 'grid' ? <div className="project-grid">
          {visibleProjects.map((project) => <ProjectCard
            key={project.id}
            project={project}
            manager={projectTeamMembers.find((member) => member.id === project.managerId)}
            members={projectTeamMembers}
            onOpen={() => setSelectedProjectId(project.id)}
            onEdit={() => openEditProject(project)}
            onDelete={() => setDeleteProjectId(project.id)}
          />)}
        </div> : <div className="table-scroll project-table-scroll">
          <table className="data-table projects-table project-directory-table">
            <thead><tr>
              <th>PROJECT NAME</th>
              <th>MANAGER</th>
              <th>TEAM</th>
              <th>PROGRESS</th>
              <th>PRIORITY</th>
              <th aria-sort={sortBy === 'Due date' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}><button className="sort-heading" onClick={() => toggleSort('Due date')}>DUE DATE{sortBy === 'Due date' ? <ArrowDownUp size={12} /> : null}</button></th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr></thead>
            <tbody>{visibleProjects.map((project) => {
              const manager = projectTeamMembers.find((member) => member.id === project.managerId)
              const team = project.teamMemberIds.map((id) => projectTeamMembers.find((member) => member.id === id)).filter(Boolean)
              return <tr key={project.id}>
                <td><button className="project-table-name" onClick={() => setSelectedProjectId(project.id)}><span className={`project-mark mark-${project.color}`}><FolderKanban size={14} /></span><span><strong>{project.name}</strong><small>{project.category} · {project.id}</small></span></button></td>
                <td><span className="project-table-manager"><Avatar initials={manager?.initials ?? '—'} color={manager?.color ?? 'blue'} size="small" />{manager?.name ?? 'Unassigned'}</span></td>
                <td><div className="project-avatar-stack">{team.slice(0, 4).map((member) => <span key={member.id} title={member.name}><Avatar initials={member.initials} color={member.color} size="small" /></span>)}{team.length > 4 && <span className="project-avatar-overflow">+{team.length - 4}</span>}</div></td>
                <td><div className="progress-cell"><div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div><small>{project.progress}%</small></div></td>
                <td><PriorityBadge priority={project.priority} /></td>
                <td>{formatProjectDate(project.dueDate)}</td>
                <td><StatusBadge>{project.status}</StatusBadge></td>
                <td><div className="project-table-actions"><button className="icon-button" aria-label={`View ${project.name}`} onClick={() => setSelectedProjectId(project.id)}><Eye size={15} /></button><button className="icon-button" aria-label={`Edit ${project.name}`} onClick={() => openEditProject(project)}><Edit3 size={15} /></button><button className="icon-button project-delete-button" aria-label={`Delete ${project.name}`} onClick={() => setDeleteProjectId(project.id)}><Trash2 size={15} /></button></div></td>
              </tr>
            })}</tbody>
          </table>
          {!visibleProjects.length && <EmptyState title="No projects found" description="Try adjusting your search or project filters." />}
        </div>}

        {view === 'grid' && !visibleProjects.length && <EmptyState title="No projects found" description="Try adjusting your search or project filters." />}
        <div className="project-pagination">
          <label>Rows per page<select aria-label="Projects per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}><option value={6}>6</option><option value={9}>9</option><option value={12}>12</option></select></label>
          <span>Showing <strong>{filteredProjects.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredProjects.length)}</strong> of <strong>{filteredProjects.length}</strong></span>
          <div className="pagination-buttons"><button className="icon-button" disabled={currentPage === 1} aria-label="Previous page" onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={17} /></button><span>Page {currentPage} of {pageCount}</span><button className="icon-button" disabled={currentPage === pageCount} aria-label="Next page" onClick={() => setPage((current) => current + 1)}><ChevronRight size={17} /></button></div>
        </div>
      </section>

      {projectModalOpen && <Modal title={editingProjectId ? 'Edit project' : 'Create a project'} description={editingProjectId ? 'Update project ownership, schedule and delivery details.' : 'Set up the plan, ownership and delivery targets for a new project.'} className="project-modal" onClose={() => setProjectModalOpen(false)} footer={<><button className="button button-secondary" onClick={() => setProjectModalOpen(false)}>Cancel</button><button className="button button-primary" type="submit" form="project-form">{editingProjectId ? <Check size={15} /> : <Plus size={15} />}{editingProjectId ? 'Save changes' : 'Create project'}</button></>}><ProjectForm values={projectForm} errors={projectErrors} onChange={updateProjectForm} onTeamToggle={toggleProjectTeam} onSubmit={submitProject} editing={Boolean(editingProjectId)} /></Modal>}
      {deleteProjectId && <Modal title="Delete project?" description="This removes the project and its task board from the local preview." onClose={() => setDeleteProjectId(null)} footer={<><button className="button button-secondary" onClick={() => setDeleteProjectId(null)}>Cancel</button><button className="button button-danger" onClick={confirmDeleteProject}><Trash2 size={14} />Delete project</button></>}><p className="delete-confirm-copy">This sample action is not connected to a backend and cannot be undone in this session.</p></Modal>}
    </div>
  )
}
