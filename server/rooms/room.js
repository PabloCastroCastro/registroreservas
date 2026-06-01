const RoomEnum = {"O Cuberto":1, "A Fonte":2, "O Carpinteiro":3, "O Faiado":4}

function getRoomId(name){
    return RoomEnum[name];
}

module.exports = getRoomId;