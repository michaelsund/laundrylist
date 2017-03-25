import { createStore } from 'redux';
import reducer from '../reducers';
import devtools from 'remote-redux-devtools';

export default function configureStore(initialState) {
  const store = createStore(
    reducer,
    devtools({
      hostname: 'localhost',
      port: 8000
    })
  );
  return store
}
