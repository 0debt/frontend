/**
 * Mock configuration for local development
 * Enable with MOCK_AUTH=true in .env
 */

export const isMockEnabled = process.env.MOCK_AUTH === "true"

export const MOCK_USER = {
  _id: "mock-id",
  name: "dev-user",
  email: "dev@local.test",
  avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=dev-user",
  plan: "FREE",
}

//Para actualizar el plan del usuario mock
export function updateMockPlan(plan: string) {
  MOCK_USER.plan = plan
}