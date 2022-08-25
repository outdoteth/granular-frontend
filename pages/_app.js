import { BodyLayout } from "../components/layout/BodyLayout";
import { EthereumProvider } from "../context/EthereumContext";
import "../styles/globals.css";

function App({ Component, pageProps }) {
  return (
    <EthereumProvider>
      <BodyLayout id="app-root">
        <Component {...pageProps} />
      </BodyLayout>
    </EthereumProvider>
  );
}

export default App;
