import { createSubmissionHandler } from '../server/submissions.js'

/** A native Node.js Vercel Function; no Next.js runtime or database. */
export default createSubmissionHandler()
