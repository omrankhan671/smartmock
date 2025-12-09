import { getByText, fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';

// Mock the alert function
const alertMock = jest.fn();
global.alert = alertMock;

// Load the HTML content
document.body.innerHTML = `
  <div class="card hover-card" onclick="startTour()">
    <h4>✨ Take a Tour</h4>
    <p class="muted">See what's new</p>
  </div>
  <script>
    function startTour() {
      alert('Welcome to the SmartMock dashboard! This tour will guide you through the main features.');
    }
  </script>
`;

describe('Dashboard Tour', () => {
  it('should call startTour when the "Take a Tour" button is clicked', () => {
    // Find the button
    const tourButton = getByText(document.body, 'Take a Tour');

    // Click the button
    fireEvent.click(tourButton);

    // Check if the alert function was called
    expect(alertMock).toHaveBeenCalledWith('Welcome to the SmartMock dashboard! This tour will guide you through the main features.');
  });
});
