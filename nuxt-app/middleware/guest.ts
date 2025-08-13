export default defineNuxtRouteMiddleware(() => {
  const auth = useAuth()
  if (auth.loggedIn.value) {
    return navigateTo('/')
  }
})
