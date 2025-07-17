import type { JSX } from "react";
import "./App.css";
import { KaoJanken } from "./components/KaoJanken";

const App = (): JSX.Element => {
	return (
		<div>
			<KaoJanken></KaoJanken>
		</div>
	);
};

export default App;
