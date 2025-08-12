import type { JSX } from "react";
import "./App.css";

import { JankenPlayground } from "./components/JankenPlayground";

function App(): JSX.Element {
	return (
		<div className="flex h-screen w-full items-center justify-center">
			<JankenPlayground />
		</div>
	);
}

export default App;
