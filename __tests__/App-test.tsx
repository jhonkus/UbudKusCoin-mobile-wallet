/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import {act} from 'react';

it('renders correctly', async () => {
  await act(async () => {
    renderer.create(<App />);
  });
});
