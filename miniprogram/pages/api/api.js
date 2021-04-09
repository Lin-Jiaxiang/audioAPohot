import request from '../../utils/request'

export function getTask(options = {}){
    return request('/audio/gettask', {
      method: 'GET',
      data: options
    })
}
