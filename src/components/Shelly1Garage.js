import React, { useEffect } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

const Shelly1Garage = ({device, http, httpAction, tile, mqtt, updateTile, useHttp, useMqtt, useMqttSub}) => {

    const device_state = useSelector(state => state.DeviceController.data[tile.id], shallowEqual) || {}
    const dispatch = useDispatch()
    const mqtt_client = useMqtt()
    const user = useSelector(state => state.User)

    let isOpen, mqttSentOpen = false

    if(device_state.inputs && device_state?.inputs[0]?.input === 0) {
        isOpen = true
    }

    if(device_state.inputs && device_state?.inputs[0]?.input === 1) {
        isOpen = false
    }

    if(device_state[mqtt['get_input_state']] === '0') {
        isOpen = true
        mqttSentOpen = true
    }

    if(device_state[mqtt['get_input_state']] === '1') {
        isOpen = false
        updateTile(dispatch, tile.id, {isClosing: false})
    }

    const is_open_txt = isOpen ? 'Open': 'Closed'
    const style = isOpen ? { color: 'red' }: {}

    useHttp(device.id, tile.id, http['get_state'])
    useHttp(device.id, tile.id, http['get_update_state'])

    useMqttSub(mqtt_client, mqtt['get_input_state'], tile.id)

    useEffect(() => {
        if(device_state.isOpening && mqttSentOpen) {
            setTimeout(() => {
                updateTile(dispatch, tile.id, {isOpening: false})
            }, 15000)
        }
    }, [mqttSentOpen])

    const handleClick = () => {
        httpAction(dispatch, user.token, device.id, tile.id, http['on'])
        isOpen && updateTile(dispatch, tile.id, {isClosing: true})
        !isOpen && updateTile(dispatch, tile.id, {isOpening: true})
    }

    if(device_state.isOpening || device_state.isClosing) {

        const door_state = device_state.isOpening ? 'Opening': 'Closing'

        return <div className="center_container">
            <div className="center_inner">
                <div className="button_loader button_loader_l"></div>
                <p>{door_state} Door...</p>
            </div>
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