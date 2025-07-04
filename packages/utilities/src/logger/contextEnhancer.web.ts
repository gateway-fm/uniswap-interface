import { datadogRum } from '@datadog/browser-rum'

// eslint-disable-next-line max-params
export function logContextUpdate(contextName: string, newState: unknown, _isDatadogEnabled: boolean): void {
  if (__DEV__) {
    return
  }
  datadogRum.addAction(contextName, {
    data: {
      newState,
    },
  })
}
