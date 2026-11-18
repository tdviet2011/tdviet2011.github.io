import { useEffect, useRef, useState } from 'react';
import { usePortfolio } from './hooks/usePortfolio';
import { projects } from './data/projects';
import { Header } from './components/Header';
import { ProjectDialog } from './components/ProjectDialog';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Skills } from './sections/Skills';
import { Projects } from './sections/Projects';
import { Research } from './sections/Research';
import { Education } from './sections/Education';
import { Contact } from './sections/Contact';
import { BootIntro } from './components/BootIntro';
import { LayoutCursor } from './components/LayoutCursor';

function projectFromHash() {
  const prefix = '#project/';
  return window.location.hash.startsWith(prefix) ? projects.find(p=>p.id===window.location.hash.slice(prefix.length)) || null : null;
}
export default function App() {
  const { t } = usePortfolio();
  const [activeProject,setActiveProject] = useState(projectFromHash);
  const opener = useRef(null);
  useEffect(()=>{
    const sync = () => setActiveProject(projectFromHash());
    window.addEventListener('hashchange',sync);
    return ()=>window.removeEventListener('hashchange',sync);
  },[]);
  function openProject(id) {
    const project=projects.find(p=>p.id===id);
    if (!project) return;
    opener.current=document.activeElement;
    window.history.pushState({tvDialog:true},'',`#project/${id}`);
    setActiveProject(project);
  }
  function closeProject() {
    if (window.history.state?.tvDialog) window.history.back();
    else window.history.replaceState(null,'','#projects');
    setActiveProject(null);
    requestAnimationFrame(()=>opener.current?.focus({preventScroll:true}));
  }
  return <><a className="skip-link" href="#main">{t.skip}</a><Header/><main id="main" tabIndex={-1}><Hero onOpen={openProject}/><About/><Skills/><Projects onOpen={openProject}/><Research onOpen={openProject}/><Education onOpen={openProject}/><Contact/></main><ProjectDialog project={activeProject} onClose={closeProject}/><LayoutCursor/><BootIntro/></>;
}
