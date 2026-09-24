import { NavLink, Outlet } from 'react-router-dom'

export function Shell() {
  const mock = import.meta.env.VITE_USE_MOCK === 'true'
  return (
    <div className="app">
      <a className="skip" href="#contenu">
        Aller au contenu
      </a>
      {mock ? (
        <p className="bandeau-mock">Mode démonstration — les données restent en mémoire, l’API .NET n’est pas appelée.</p>
      ) : null}
      <header className="barre">
        <div className="barre-marque">
          <p className="marque">Guichet</p>
          <p className="marque-sous">Demandes d’intervention</p>
        </div>
        <nav className="barre-nav" aria-label="Navigation principale">
          <NavLink to="/" end>
            Liste
          </NavLink>
          <NavLink to="/demandes/nouvelle" className="bouton bouton-primaire">
            Nouvelle demande
          </NavLink>
        </nav>
      </header>
      <main id="contenu" className="contenu">
        <Outlet />
      </main>
    </div>
  )
}
