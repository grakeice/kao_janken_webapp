import type { JSX } from "react";
import "./App.css";
import { KaoJanken } from "./components/KaoJanken";

function App(): JSX.Element {
	return (
		<div>
			<KaoJanken></KaoJanken>
		</div>
	);
}

export default App;
