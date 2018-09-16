import * as React from 'react'
import StateStore  from './StateStore'
import { AppProps } from '../components/App'

/**
 * Adapted from https://gist.github.com/gaearon/1d19088790e70ac32ea636c025ba424e
 */

type ComponentDefinition <T> = React.ComponentClass<T> | React.SFC<T>

export default function connectWithStore<OwnProps>(
  Subscriber: ComponentDefinition<AppProps>
): React.ComponentClass<OwnProps> {
  const store = StateStore.singleton()
  return class extends React.Component<OwnProps & AppProps> {
    private unsubscribe: VoidFunction

    render() {
      return <Subscriber {...this.props}
                         {...store.getState()}
                         actions={store.actions} />
    }

    componentDidMount() {
      this.unsubscribe = store.subscribe(this.handleChange)
    }

    componentWillUnmount() {
      this.unsubscribe()
    }

    handleChange = () => this.forceUpdate()
  }
}