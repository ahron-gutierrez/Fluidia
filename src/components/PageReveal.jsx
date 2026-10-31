import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Black curtain that scrolls away when a page opens (pairs with the lobby curtain).
function PageReveal() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setVisible(false), 800);
    return () => clearTimeout(id);
  }, []);

  return visible ? createPortal(<div className="lobby-curtain phase-reveal" />, document.body) : null;
}

export default PageReveal;
