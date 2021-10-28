import React, { useEffect } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

const Shelly1Garage = ({device, http, httpAction, tile, mqtt, updateTile, useHttp, useMqtt, useMqttSub}) => {

    const device_state = useSelector(state => state.DeviceController.data[tile.id], shallowEqual) || {}
    const dispatch = useDispatch()
    const mqtt_client = useMqtt()
    const user = useSelector(state => state.User)
    const isOpen = device_state.isOpen || false

    console.log('device_state', device_state)

    if(device_state[http['get_state']]?.inputs && device_state[http['get_state']]?.inputs[0]?.input === 0 && device_state[mqtt['get_input_state']] === undefined) {
        !isOpen && updateTile(dispatch, tile.id, {isOpen: true})
    }

    if(device_state[http['get_state']]?.inputs && device_state[http['get_state']]?.inputs[0]?.input === 1 && device_state[mqtt['get_input_state']] === undefined) {
        isOpen && updateTile(dispatch, tile.id, {isOpen: false})
    }

    if(device_state[mqtt['get_input_state']] === '0') {
        !isOpen && device_state[mqtt['get_input_state']].isFromClick && updateTile(dispatch, tile.id, {isOpen: true, isFromClick: false})
        !isOpen && !device_state[mqtt['get_input_state']].isFromClick && updateTile(dispatch, tile.id, {isOpen: true, isOpening: true, isFromClick: false})
    }

    if(device_state[mqtt['get_input_state']] === '1') {
        isOpen && updateTile(dispatch, tile.id, {isOpen: false, isClosing: false})
    }
    
    const is_open_txt = isOpen ? 'Open': 'Closed'
    const style = isOpen ? { color: 'red' }: {}

    useHttp(device.id, tile.id, http['get_state'])
    useHttp(device.id, tile.id, http['get_update_state'])

    useMqttSub(mqtt_client, mqtt['get_input_state'], tile.id)
    useMqttSub(mqtt_client, mqtt['get_longpush'], tile.id)

    useEffect(() => {
        if(device_state.isOpening) {
            setTimeout(() => {
                updateTile(dispatch, tile.id, {isOpening: false})
            }, 15000)
        }
    }, [device_state.isOpening])

    const handleClick = () => {
        isOpen && updateTile(dispatch, tile.id, {isClosing: true})
        !isOpen && updateTile(dispatch, tile.id, {isOpening: true, isFromClick: true})
        httpAction(dispatch, user.token, device.id, tile.id, http['on'])
    }

    if(device_state.isOpening || device_state.isClosing) {

        const door_state = device_state.isOpening ? 'Opening': 'Closing'

        return <div className="txt_center"><br />
            <div className="button_loader button_loader_l"></div>
            <p>{door_state} Door...</p>
        </div>
    }

    return (
        <div className="txt_center">
            <div className="tile-icon">
                <span 
                    onClick={handleClick} 
                    title={`Garage Door is: ${is_open_txt}`}
                    style={style} 
                    className="material-icons f75 pointer"
                >sensor_door</span>
            </div>
            <div style={style}>{is_open_txt}</div>
        </div>
    )
}

export default Shelly1Garage