import { useLocation, useNavigate } from 'react-router-dom';

function BackToHomePage({ to, children, className }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();

    if (location.pathname !== "/") {
      navigate("/", { replace: true });

      setTimeout(() => {
        const section = document.querySelector(to);
        section?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const section = document.querySelector(to);
      section?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

export default BackToHomePage;