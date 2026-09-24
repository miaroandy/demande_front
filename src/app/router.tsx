import { createBrowserRouter } from 'react-router-dom'
import { Shell } from '../components/Shell'
import { CreationPage } from '../pages/CreationPage'
import { DetailPage } from '../pages/DetailPage'
import { ListePage } from '../pages/ListePage'
import { PageInconnue } from '../pages/PageInconnue'

export const routeur = createBrowserRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <ListePage /> },
      { path: 'demandes/nouvelle', element: <CreationPage /> },
      { path: 'demandes/:id', element: <DetailPage /> },
      { path: '*', element: <PageInconnue /> },
    ],
  },
])
