


exports.saveEvent = async (req, res, next) => {
    let eventData = req.body;
    console.log("eventData",eventData)
    res.status(200).json({
        status: 200,
        success: true,
        data: null
    })
}