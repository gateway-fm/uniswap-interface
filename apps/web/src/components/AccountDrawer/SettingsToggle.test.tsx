import { SettingsToggle } from 'components/AccountDrawer/SettingsToggle'
import { act, render } from 'test-utils/render'

describe('SettingsToggle', () => {
  it('Updates value on click', () => {
    let mockActive = false
    const mockToggle = vi.fn().mockImplementation(() => (mockActive = !mockActive))
    const component = render(
      <SettingsToggle
        dataid="testId"
        title="Test toggle"
        description="Test description"
        isActive={mockActive}
        toggle={mockToggle}
      />,
    )

    expect(mockActive).toBeFalsy()
    expect(component.container).toHaveTextContent('Test toggle')
    expect(component.container).toHaveTextContent('Test description')

    act(() => component.getByTestId('testId').click())
    expect(mockToggle).toHaveBeenCalledTimes(1)
    expect(mockActive).toBeTruthy()

    act(() => component.getByTestId('testId').click())
    expect(mockToggle).toHaveBeenCalledTimes(2)
    expect(mockActive).toBeFalsy()
  })
})
