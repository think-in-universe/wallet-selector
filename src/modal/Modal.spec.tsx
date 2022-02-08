import React from 'react'
import { render, act, fireEvent } from "@testing-library/react";
import Modal from './Modal';
import { getState, updateState } from "../state/State";
import State from '../types/State';

const showModal = () => {
  updateState((state: State) => ({
    ...state,
    showModal: true,
  }));
};

describe('Modal Unit Tests', () => {

  it('renders the basic elements and show/hide the container', () => {
    const  { getByTestId } = render(<Modal />);

    expect(getByTestId('Modal.Container').style.display).toBe('none');
    act(() => {
      showModal();
    });

    expect(getByTestId('Modal.Container').style.display).toBe('block');
  });

  it('should close the modal', () => {
    const  { getByTestId } = render(<Modal />);

    act(() => {
      showModal();
    });

    fireEvent.click(getByTestId('Modal.Backdrop'));

    expect(getByTestId('Modal.Container').style.display).toBe('none');
  });

  it('should show a description', () => {
    const { findByText } = render(<Modal />);

    act(() => {
      updateState(state => ({
        ...state,
        showModal: true,
        options: {
          ...state.options || {},
          walletSelectorUI: {
            ...state.options.walletSelectorUI || {},
            description: 'This is a description',
          }
        }
      }));
    });

    findByText('This is a description');
  });

  it('should show all wallet options', async () => {
    const { findAllByTestId } = render(<Modal />);
    const { options: { wallets }, walletProviders } = getState();

    expect((await findAllByTestId('Modal.ListItem')).length).toBe(wallets.filter(wallet => walletProviders[wallet]?.getShowWallet()).length);
  });

});
