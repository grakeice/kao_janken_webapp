import type { JSX } from "react";
import "./App.css";
import { JankenPlayground } from "./components/JankenPlayground";

function App(): JSX.Element {
	return (
		<div>
			<JankenPlayground />
		</div>
	);
}

export default App;
