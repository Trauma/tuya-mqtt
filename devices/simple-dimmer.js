const TuyaDevice = require('./tuya-device')
const debug = require('debug')('tuya-mqtt:tuya')
const utils = require('../lib/utils')

class SimpleDimmer extends TuyaDevice {
    async init() {
        // Set device specific variables
        this.config.dpsPower = this.config.dpsPower ? this.config.dpsPower : 1
        this.config.dpsBrightness = this.config.dpsBrightness ? this.config.dpsBrightness : 2
        this.config.brightnessScale = this.config.brightnessScale ? this.config.brightnessScale : 255

        this.deviceData.mdl = 'Dimmer Switch'

        // Map generic DPS topics to device specific topic names
        this.deviceTopics = {
            state: {
                key: this.config.dpsPower,
                type: 'bool'
            },
            brightness_state: { 
                key: this.config.dpsBrightness,
                type: 'int',
                min: (this.config.brightnessScale = 1000) ? 10 : 1,
                max: this.config.brightnessScale,
                scale: this.config.brightnessScale
            }
        }

        // Send home assistant discovery data and give it a second before sending state updates
        this.initDiscovery()
        await utils.sleep(1)

        // Get initial states and start publishing topics
        this.getStates()
    }

    initDiscovery() {
        const configTopic = 'homeassistant/light/'+this.config.id+'/config'

        const discoveryData = {
            name: (this.config.name) ? this.config.name : this.config.id,
            state_topic: this.baseTopic+'state',
            command_topic: this.baseTopic+'command',
            brightness_state_topic: this.baseTopic+'brightness_state',
            brightness_command_topic: this.baseTopic+'brightness_command',
            unique_id: this.config.id,
            device: this.deviceData
        }

        debug('Home Assistant config topic: '+configTopic)
        debug(discoveryData)
        this.publishMqtt(configTopic, JSON.stringify(discoveryData))
    }
}

module.exports = SimpleDimmer