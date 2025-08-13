export default defineNuxtRouteMiddleware(() => {
  const auth = useAuth()
  if (auth.loggedIn) {
    return navigateTo('/')
  }
})
