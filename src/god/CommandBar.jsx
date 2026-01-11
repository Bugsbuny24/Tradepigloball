import { useState } from "react";

export default function CommandBar() {
  const [cmd, setCmd] = useState("");

  const submit = () => {
    alert("Intent gönderildi: " + cmd);
    setCmd("");
  };

  return (
    <div className="command-bar">
      <input
        value={cmd}
        onChange={e => setCmd(e.target.value)}
        placeholder="> sistemi dengede tut"
      />
      <button onClick={submit}>↵</button>
    </div>
  );
}
