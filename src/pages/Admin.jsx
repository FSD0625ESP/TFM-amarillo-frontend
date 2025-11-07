import React, { useState, useEffect } from "react";
import PhotoCard from "../components/admin/PhotoCard";
import PhotoGrid from "../components/admin/PhotoGrid";
import FactList from "../components/admin/FactList.jsx";
import "./Admin.css";

export default function Admin() {
  const [photos, setPhotos] = useState([]);
  const [activeSection, setActiveSection] = useState("home");
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    fetch("http://localhost:3000/photos")
      .then((res) => res.json())
      .then((data) => setPhotos(data))
      .catch((err) => console.error("Error fetching photos:", err));
  }, []);

  useEffect(() => {
    const storedName = localStorage.getItem("adminName");
    if (storedName && storedName.trim() !== "") {
      setAdminName(storedName);
    } else {
      setAdminName("Admin");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    window.location.href = "/adminlogin";
  };

  return (
    <div data-theme="light" className="drawer drawer-open admin-layout">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <div className="p-6">
          {activeSection === "home" && (
            <>
              <h1 className="text-2xl font-bold mb-4">Bienvenido, {adminName}</h1>
              <p className="text-gray-600">Desde este panel puedes gestionar fotos, usuarios, facts y ver estadísticas.</p>
            </>
          )}
          {activeSection === "fotos" && (
            <div>
              <PhotoGrid photos={photos} setPhotos={setPhotos} />
            </div>
          )}
          {activeSection === "facts" && (
            <div>
              <FactList />
            </div>
          )}
        </div>

        {/* La sección de fotos se muestra solo cuando se navega a "Fotos" desde el menú lateral */}
      </div>

  <div className="drawer-side is-drawer-close:overflow-visible">
    <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
    <div className="is-drawer-close:w-14 is-drawer-open:w-64 bg-base-200 flex flex-col items-start min-h-full">
      {/* Sidebar content here */}
      <ul className="menu w-full grow">

        

        {/* list item */}
        <li>
          <button onClick={() => setActiveSection("home")} className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Homepage">
            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block size-4 my-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9.75L12 3l9 6.75V21a.75.75 0 0 1-.75.75H3.75A.75.75 0 0 1 3 21V9.75Z" />
              <path d="M9 22V12h6v10" />
            </svg>
            <span className="is-drawer-close:hidden">Homepage</span>
          </button>
        </li>

          {/* list item */}
        <li>
          <button onClick={() => setActiveSection("usuarios")} className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Usuarios">
            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block size-4 my-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="7" r="4" />
              <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
            </svg>
            <span className="is-drawer-close:hidden">Usuarios</span>
          </button>
        </li>



        {/* list item */}
        <li>
          <button onClick={() => setActiveSection("fotos")} className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Fotos">
            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block size-4 my-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 15V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18" />
              <path strokeLinecap="round" strokeLinejoin="round" d="m8 11 2 2 4-4 5 5" />
            </svg>
            <span className="is-drawer-close:hidden">Fotos</span>
          </button>
        </li>

                {/* list item */}
        <li>
          <button onClick={() => setActiveSection("facts")} className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Facts">
            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block size-4 my-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182L7.5 19.213 3 21l1.787-4.5L16.862 3.487Z" />
            </svg>
            <span className="is-drawer-close:hidden">Facts</span>
          </button>
        </li>

                  {/* list item */}
        <li>
          <button onClick={() => setActiveSection("estadisticas")} className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Estadisticas">
            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block size-4 my-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18" />
              <path d="M18 17V9" />
              <path d="M13 17V5" />
              <path d="M8 17v-3" />
            </svg>
            <span className="is-drawer-close:hidden">Estadisticas</span>
          </button>
        </li>


        {/* list item */}
        <li>
          <button onClick={() => setActiveSection("settings")} className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Settings">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="inline-block size-4 my-1.5"><path d="M20 7h-9"></path><path d="M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle></svg>
            <span className="is-drawer-close:hidden">Settings</span>
          </button>
        </li>

        <li>
          <button onClick={handleLogout} className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Logout">
            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block size-4 my-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10v1" />
            </svg>
            <span className="is-drawer-close:hidden">Cerrar sesión</span>
          </button>
        </li>



      </ul>


      {/* button to open/close drawer */}
      <div className="m-2 is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Open">
        <label htmlFor="my-drawer-4" className="btn btn-ghost btn-circle drawer-button is-drawer-open:rotate-y-180">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="inline-block size-4 my-1.5"><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path><path d="M9 4v16"></path><path d="M14 10l2 2l-2 2"></path></svg>
        </label>
      </div>

    </div>
  </div>
</div>
  );
}
