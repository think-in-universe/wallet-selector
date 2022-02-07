import { getState, state, updateState } from "./State";
describe('State Unit Tests', () => {
  it('should have an initial state', () => {
    expect(state).toBeDefined();
  });

  it('should retrieve the same state', () => {
    const retrieved = getState();
    expect(retrieved).toEqual(state.current);
  });

  it('should update the state', () => {
    const isSignedIn = getState().isSignedIn;
    updateState(state => {
      return {
        ...state,
        isSignedIn: !isSignedIn
      }
    });

    const updatedState = getState();
    expect(updatedState.isSignedIn).toEqual(!isSignedIn);
  });
});
