const pool = require("../config/db");
function nullIfEmpty(value) {
    if (value === undefined || value === null) {
        return null;
    }

    if (typeof value === "string" && value.trim() === "") {
        return null;
    }

    return value;
}
async function sendToGoogleSheets(payload) {
    const url = process.env.GOOGLE_SHEETS_WEB_APP_URL;

    if (!url) {
        throw new Error("GOOGLE_SHEETS_WEB_APP_URL is not configured.");
    }

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!result.success) {
        throw new Error(
            result.error || "Google Sheets submission failed."
        );
    }

    return result;
}
/* =====================================================
   SUBMIT DAILY REPORT
===================================================== */

const submitDailyReport = async (req, res) => {

    const client = await pool.connect();

    try {

        const {
            reportDate,
            officerName,
            workingLocation,
            attendanceStatus,

            farmers = [],
            fieldVisits = [],
            plantations = [],
            plantsLifted = [],
            ffbPurchases = []

        } = req.body;


        /* =================================================
           BASIC VALIDATION
        ================================================== */

        if (
            !reportDate ||
            !officerName ||
            !workingLocation
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Report date, officer name, working location and attendance status are required."
            });

        }


        if (
            attendanceStatus &&
            !["Present", "Absent"].includes(attendanceStatus)
        ) {
            return res.status(400).json({
                success: false,
                message: "Attendance status must be Present or Absent."
            });
        }
        /* =================================================
           START TRANSACTION
        ================================================== */

        await client.query("BEGIN");


        /* =================================================
           1. CREATE DAILY REPORT
        ================================================== */

        const reportResult = await client.query(
            `
            INSERT INTO daily_reports
            (
                report_date,
                officer_name,
                working_location,
                attendance_status
            )
            VALUES ($1, $2, $3, $4)
            RETURNING id
            `,
            [
                reportDate,
                officerName,
                workingLocation,
                attendanceStatus
            ]
        );


        const reportId =
            reportResult.rows[0].id;


        /* =================================================
           2. NEW FARMERS
        ================================================== */

        for (const farmer of farmers) {

            await client.query(
                `
                INSERT INTO new_farmer_identification
                (
                    report_id,
                    farmer_name,
                    village,
                    mandal,
                    extent_holding_acre,
                    borewell_openwell,
                    existing_crop,
                    oil_palm_proposed_area_acre,
                    expected_season,
                    mobile_no,
                    plant_dd,
                    drip_dd,
                    dd_paid_yes_no,
                    remarks
                )
                VALUES
                (
                    $1, $2, $3, $4, $5, $6, $7,
                    $8, $9, $10, $11, $12, $13, $14
                )
                `,
                [
                    reportId,
                    nullIfEmpty(farmer.farmerName),
                    nullIfEmpty(farmer.village),
                    nullIfEmpty(farmer.mandal),
                    nullIfEmpty(farmer.extentHoldingAcre),
                    nullIfEmpty(farmer.borewellOpenwell),
                    nullIfEmpty(farmer.existingCrop),
                    nullIfEmpty(farmer.oilPalmProposedAreaAcre),
                    nullIfEmpty(farmer.expectedSeason),
                    nullIfEmpty(farmer.mobileNo),
                    nullIfEmpty(farmer.plantDD),
                    nullIfEmpty(farmer.dripDD),
                    nullIfEmpty(farmer.ddPaidYesNo),
                    nullIfEmpty(farmer.remarks)
                ]
            );
        }
        /* =================================================
           3. FIELD VISITS
        ================================================== */
        for (const visit of fieldVisits) {
            await client.query(
                `
                INSERT INTO field_visits
                (
                    report_id,
                    farmer_name,
                    field_garden,
                    village,
                    mandal,
                    no_of_acres,
                    mobile_no,
                    plant_health,
                    remarks
                )
                VALUES
                (
                    $1, $2, $3, $4, $5,
                    $6, $7, $8, $9
                )
                `,
                [
                    reportId,
                    nullIfEmpty(visit.farmerName),
                    nullIfEmpty(visit.fieldGarden),
                    nullIfEmpty(visit.village),
                    nullIfEmpty(visit.mandal),
                    nullIfEmpty(visit.noOfAcres),
                    nullIfEmpty(visit.mobileNo),
                    nullIfEmpty(visit.plantHealth),
                    nullIfEmpty(visit.remarks)
                ]
            );
        }
        /* =================================================
           4. PLANTATION COMPLETED
        ================================================== */
        for (const plantation of plantations) {

            await client.query(
                `
                INSERT INTO plantation_completed
                (
                    report_id,
                    farmer_name,
                    village,
                    mandal,
                    plantation_acres,
                    no_of_seedlings,
                    nursery_name,
                    planting_method,
                    remarks
                )
                VALUES
                (
                    $1, $2, $3, $4, $5,
                    $6, $7, $8, $9
                )
                `,
                [
                    reportId,
                    nullIfEmpty(plantation.farmerName),
                    nullIfEmpty(plantation.village),
                    nullIfEmpty(plantation.mandal),
                    nullIfEmpty(plantation.plantationAcres),
                    nullIfEmpty(plantation.noOfSeedlings),
                    nullIfEmpty(plantation.nurseryName),
                    nullIfEmpty(plantation.plantingMethod),
                    nullIfEmpty(plantation.remarks)
                ]
            );
        }
        /* =================================================
           5. PLANT LIFTED
        ================================================== */
        for (const plant of plantsLifted) {
            await client.query(
                `
                INSERT INTO plant_lifted
                (
                    report_id,
                    farmer_name,
                    village,
                    mandal,
                    plantation_acres,
                    no_of_seedlings,
                    nursery_name,
                    planting_method,
                    remarks
                )
                VALUES
                (
                    $1, $2, $3, $4, $5,
                    $6, $7, $8, $9
                )
                `,
                [
                    reportId,
                    nullIfEmpty(plant.farmerName),
                    nullIfEmpty(plant.village),
                    nullIfEmpty(plant.mandal),
                    nullIfEmpty(plant.plantationAcres),
                    nullIfEmpty(plant.noOfSeedlings),
                    nullIfEmpty(plant.nurseryName),
                    nullIfEmpty(plant.plantingMethod),
                    nullIfEmpty(plant.remarks)
                ]
            );
        }
        /* =================================================
           6. FFB PURCHASES
        ================================================== */

        for (const purchase of ffbPurchases) {

            await client.query(
                `
                INSERT INTO ffb_purchases
                (
                    report_id,
                    collection_date,
                    ffb_price,
                    quantity_dispatched_mt,
                    factory_weighment_mt,
                    ffb_loading_charges,
                    ffb_transportation_charges,
                    farmer_name,
                    village,
                    mandal,
                    quantity_mt,
                    mobile_no,
                    remarks
                )
                VALUES
                (
                    $1, $2, $3, $4, $5, $6, $7,
                    $8, $9, $10, $11, $12, $13
                )
                `,
                [
                    reportId,
                    nullIfEmpty(purchase.collectionDate),
                    nullIfEmpty(purchase.ffbPrice),
                    nullIfEmpty(purchase.quantityDispatchedMt),
                    nullIfEmpty(purchase.factoryWeighmentMt),
                    nullIfEmpty(purchase.ffbLoadingCharges),
                    nullIfEmpty(purchase.ffbTransportationCharges),
                    nullIfEmpty(purchase.farmerName),
                    nullIfEmpty(purchase.village),
                    nullIfEmpty(purchase.mandal),
                    nullIfEmpty(purchase.quantityMt),
                    nullIfEmpty(purchase.mobileNo),
                    nullIfEmpty(purchase.remarks)
                ]
            );
        }
        /* =================================================
           COMMIT
        ================================================== */
        await client.query("COMMIT");
        // =================================================
        // SEND REPORT TO GOOGLE SHEETS
        // =================================================

        // =================================================
        // SEND TO GOOGLE SHEETS IN BACKGROUND
        // =================================================

        sendToGoogleSheets({
            reportDate,
            report: {
                reportDate,
                officerName,
                workingLocation,
                attendanceStatus
            },

            newFarmers: farmers,
            fieldVisits,
            plantations,
            plantsLifted,
            ffbPurchases

        }).then((result) => {

            console.log(
                "Google Sheets updated successfully:",
                result
            );

        }).catch((googleError) => {

            console.error(
                "Google Sheets background update failed:",
                googleError.message
            );

        });
        /* =================================================
           SUCCESS RESPONSE
        ================================================== */
        res.status(201).json({
            success: true,
            message: "Daily report submitted successfully.",
            reportId: reportId,

            summary: {
                farmers: farmers.length,
                fieldVisits: fieldVisits.length,
                plantations: plantations.length,
                plantsLifted: plantsLifted.length,
                ffbPurchases: ffbPurchases.length
            }
        });
    } catch (error) {
        /* ================================================
           ROLLBACK IF ANYTHING FAILS
        ================================================= */
        await client.query("ROLLBACK");
        console.error(
            "Daily report submission error:",
            error
        );
        res.status(500).json({
            success: false,
            message:
                "Failed to submit daily report.",
            error: error.message
        });
    } finally {
        client.release();
    }
};
module.exports = {
    submitDailyReport
};