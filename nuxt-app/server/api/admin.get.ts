export default defineEventHandler((event) => {
    // middleware ensures only admins reach here
    return { message: 'admin access granted', user: event.context.admin }
})