import React from "react";

export default function AdminSidebar({
  onNavigate,
  onShowAllPhotos,
  onLogout,
  onlineCount,
}) {
  return (
    <div className="drawer-side is-drawer-close:overflow-visible">
      <label
        htmlFor="my-drawer-4"
        aria-label="close sidebar"
        className="drawer-overlay"
      ></label>
      <div className="is-drawer-close:w-14 is-drawer-open:w-64 bg-base-200 flex flex-col items-start min-h-full">
        <ul className="menu w-full grow">
          <li>
            <button
              onClick={() => onNavigate("home")}
              className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
              data-tip="Inicio"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="inline-block size-4 my-1.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 11L12 3l9 8" />
                <path d="M5 10v10h5v-5h4v5h5V10" />
              </svg>
              <span className="is-drawer-close:hidden">Inicio</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onNavigate("usuarios")}
              className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
              data-tip="Usuarios"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="inline-block size-4 my-1.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="7" r="4" />
                <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
              </svg>
              <span className="is-drawer-close:hidden flex items-center gap-2">
                Usuarios
                <span className="badge badge-success badge-sm">
                  {onlineCount}
                </span>
              </span>
            </button>
          </li>

          <li>
            <button
              onClick={onShowAllPhotos}
              className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
              data-tip="Fotos"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="inline-block size-4 my-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 15V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 21h18"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8 11 2 2 4-4 5 5"
                />
              </svg>
              <span className="is-drawer-close:hidden">Fotos</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onNavigate("facts")}
              className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
              data-tip="Facts"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="inline-block size-4 my-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182L7.5 19.213 3 21l1.787-4.5L16.862 3.487Z"
                />
              </svg>
              <span className="is-drawer-close:hidden">Facts</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onNavigate("estadisticas")}
              className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
              data-tip="Estadisticas"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="inline-block size-4 my-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 3v18h18" />
                <path d="M18 17V9" />
                <path d="M13 17V5" />
                <path d="M8 17v-3" />
              </svg>
              <span className="is-drawer-close:hidden">Estadisticas</span>
            </button>
          </li>

          <li>
            <button
              onClick={onLogout}
              className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
              data-tip="Logout"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="inline-block size-4 my-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10v1"
                />
              </svg>
              <span className="is-drawer-close:hidden">Cerrar sesión</span>
            </button>
          </li>
        </ul>

        <div
          className="m-2 is-drawer-close:tooltip is-drawer-close:tooltip-right"
          data-tip="Open"
        >
          <label
            htmlFor="my-drawer-4"
            className="btn btn-ghost btn-circle drawer-button is-drawer-open:rotate-y-180"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2"
              fill="none"
              stroke="currentColor"
              className="inline-block size-4 my-1.5"
            >
              <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
              <path d="M9 4v16"></path>
              <path d="M14 10l2 2l-2 2"></path>
            </svg>
          </label>
        </div>
      </div>
    </div>
  );
}
