import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { routeur } from './router'

const client = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
})

export function App() {
  return (
    <QueryClientProvider client={client}>
      <RouterProvider router={routeur} />
    </QueryClientProvider>
  )
}
