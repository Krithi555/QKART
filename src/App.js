import Register from "./components/Register";
import { Route, Switch } from "react-router-dom";
import Login from "./components/Login";
import Products from "./components/Products";
import Checkout from "./components/Checkout";
import Thanks from "./components/Thanks";


export const config = {
  endpoint: `https://qkart-frontend-jjko.onrender.com/api/v1`,
  // endpoint: `http://${ipConfig.workspaceIp}:8082/api/v1`,
};

function App() {
  return (
    <Switch>
      <Route exact path="/" component={Products} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route exact path="/checkout" component={Checkout} />
      <Route exact path="/thanks" component={Thanks} />

    </Switch>
   /* <div className="App">
          <Register />
    </div>*/
  );
}

export default App;
