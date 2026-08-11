document.addEventListener("DOMContentLoaded", () => {

    const reportForm = document.getElementById("dailyReportForm");
    const reportDate = document.getElementById("reportDate");

    /* =====================================================
       SET TODAY'S DATE
    ====================================================== */

    function setTodayDate() {

        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        reportDate.value = `${year}-${month}-${day}`;
    }

    setTodayDate();


    /* =====================================================
       ACTIVITY CONFIGURATION
    ====================================================== */

    const activities = {

        farmer: {
            buttonSelector: '[data-action="add-farmer"]',
            templateId: "farmerTemplate",
            containerId: "newFarmerEntries",
            sectionId: "newFarmerSection",
            entryName: "Farmer",
            saveText: "Save Farmer"
        },

        fieldVisit: {
            buttonSelector: '[data-action="add-field-visit"]',
            templateId: "fieldVisitTemplate",
            containerId: "fieldVisitEntries",
            sectionId: "fieldVisitSection",
            entryName: "Visit",
            saveText: "Save Visit"
        },

        plantation: {
            buttonSelector: '[data-action="add-plantation"]',
            templateId: "plantationTemplate",
            containerId: "plantationEntries",
            sectionId: "plantationSection",
            entryName: "Plantation",
            saveText: "Save Plantation"
        },

        plantLifted: {
            buttonSelector: '[data-action="add-plant-lifted"]',
            templateId: "plantLiftedTemplate",
            containerId: "plantLiftedEntries",
            sectionId: "plantLiftedSection",
            entryName: "Plant Lifted",
            saveText: "Save Plant Lifted"
        },

        ffb: {
            buttonSelector: '[data-action="add-ffb"]',
            templateId: "ffbTemplate",
            containerId: "ffbEntries",
            sectionId: "ffbSection",
            entryName: "Purchase",
            saveText: "Save Purchase"
        }

    };


    /* =====================================================
       HELPER FUNCTIONS
    ====================================================== */

    function getValue(entry, selector) {

        const field = entry.querySelector(selector);

        if (!field) {
            return "";
        }

        return field.value.trim();
    }

    function getNumber(entry, selector) {
        const value = getValue(entry, selector);
        return value === "" ? null : Number(value);
    }

    /* =====================================================
       AUTO-SAVE OPEN ENTRIES
    ====================================================== */

    function autoSaveOpenEntries() {
        return true;
    }


    /* =====================================================
       ADD ENTRY
    ====================================================== */

    function addEntry(activityKey) {

        const config = activities[activityKey];

        if (!config) {
            return;
        }
        const template =
            document.getElementById(config.templateId);

        const container =
            document.getElementById(config.containerId);

        const section =
            document.getElementById(config.sectionId);


        if (!template || !container || !section) {

            console.error(
                "Activity elements not found:",
                activityKey
            );

            return;
        }


        /*
         * Clone template
         */
        const entry = template.content.cloneNode(true);
        const entryCard = entry.querySelector(".entry-card");
        entryCard.classList.add("unsaved");

        /*
         * Add entry
         */
        container.appendChild(entry);
        /*
         * Get actual entry card
         */

        const entryCards =
            container.querySelectorAll(".entry-card");

        const newEntry =
            entryCards[entryCards.length - 1];


        /*
         * Update numbering
         */

        updateEntryNumbers(activityKey);


        section.classList.add("has-entries");


        /*
         * Attach events
         */

        attachEntryEvents(
            activityKey,
            newEntry
        );


        /*
         * Add Another button
         */

        updateAddAnotherButton(activityKey);


        /*
         * Scroll to new entry
         */

        setTimeout(() => {

            newEntry.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }, 100);
    }


    /* =====================================================
       ATTACH ENTRY EVENTS
    ====================================================== */

    function attachEntryEvents(activityKey, entryCard) {

        if (!entryCard) {
            return;
        }


        /*
         * SAVE
         */

        const saveButton =
            entryCard.querySelector(".save-entry-btn");

        if (saveButton) {

            saveButton.addEventListener("click", () => {

                if (!validateEntry(entryCard)) {
                    return;
                }

                saveEntry(
                    activityKey,
                    entryCard
                );

            });
        }


        /*
         * CANCEL
         */

        const cancelButton =
            entryCard.querySelector(".cancel-entry-btn");

        if (cancelButton) {

            cancelButton.addEventListener("click", () => {

                removeEntry(
                    activityKey,
                    entryCard
                );

            });
        }


        /*
         * REMOVE
         */

        const removeButton =
            entryCard.querySelector(".remove-entry-btn");

        if (removeButton) {

            removeButton.addEventListener("click", () => {

                removeEntry(
                    activityKey,
                    entryCard
                );

            });
        }
    }


    /* =====================================================
       VALIDATE ENTRY
    ====================================================== */

    function validateEntry(entryCard) {

        const requiredFields =
            entryCard.querySelectorAll(
                "input[required], select[required], textarea[required]"
            );

        let valid = true;


        requiredFields.forEach(field => {

            field.classList.remove("invalid");

            if (!field.value.trim()) {

                field.classList.add("invalid");

                valid = false;
            }

        });


        if (!valid) {

            const firstInvalid =
                entryCard.querySelector(".invalid");

            if (firstInvalid) {

                firstInvalid.focus();

                firstInvalid.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }

            alert("Please fill all required fields.");

            return false;
        }


        /*
         * Mobile number validation
         */

        const mobileFields =
            entryCard.querySelectorAll(
                'input[type="tel"]'
            );


        for (const mobile of mobileFields) {

            const mobileValue =
                mobile.value.trim();

            if (!mobileValue) {
                continue;
            }


            if (!/^[0-9]{10}$/.test(mobileValue)) {

                mobile.classList.add("invalid");

                mobile.focus();

                alert(
                    "Please enter a valid 10-digit mobile number."
                );

                return false;
            }
        }


        return true;
    }


    /* =====================================================
       SAVE ENTRY
    ====================================================== */

    function saveEntry(activityKey, entryCard) {

        entryCard.classList.remove("unsaved");

        entryCard.classList.add("saved");


        /*
         * Visual state
         */

        entryCard.style.borderColor = "#b9d8c4";


        /*
         * Change Save button
         */

        const saveButton =
            entryCard.querySelector(".save-entry-btn");

        if (saveButton) {

            saveButton.textContent = "✓ Saved";

            saveButton.disabled = true;

            saveButton.style.opacity = "0.75";
        }


        /*
         * Hide Cancel
         */

        const cancelButton =
            entryCard.querySelector(".cancel-entry-btn");

        if (cancelButton) {
            cancelButton.style.display = "none";
        }


        /*
         * Update Add Another
         */

        updateAddAnotherButton(activityKey);


        /*
         * Update numbering
         */

        updateEntryNumbers(activityKey);


        /*
         * Confirmation
         */

        showTemporaryMessage(
            entryCard,
            "Entry saved successfully."
        );
    }


    /* =====================================================
       REMOVE ENTRY
    ====================================================== */

    function removeEntry(activityKey, entryCard) {

        if (!entryCard) {
            return;
        }


        const isSaved =
            entryCard.classList.contains("saved");


        /*
         * Confirm only saved entries
         */

        if (
            isSaved &&
            !confirm("Remove this entry?")
        ) {
            return;
        }


        entryCard.style.transition =
            "opacity 0.2s ease, transform 0.2s ease";

        entryCard.style.opacity = "0";

        entryCard.style.transform =
            "translateY(-5px)";


        setTimeout(() => {

            entryCard.remove();

            updateEntryNumbers(activityKey);

            updateAddAnotherButton(activityKey);

            updateSectionState(activityKey);

        }, 200);
    }


    /* =====================================================
       UPDATE ENTRY NUMBERS
    ====================================================== */

    function updateEntryNumbers(activityKey) {

        const config =
            activities[activityKey];

        const container =
            document.getElementById(
                config.containerId
            );

        if (!container) {
            return;
        }


        const entries =
            container.querySelectorAll(".entry-card");


        entries.forEach((entry, index) => {

            const number =
                entry.querySelector(".entry-index");

            if (number) {
                number.textContent = index + 1;
            }

        });
    }


    /* =====================================================
       ADD ANOTHER BUTTON
    ====================================================== */

    function updateAddAnotherButton(activityKey) {

        const config =
            activities[activityKey];

        const container =
            document.getElementById(
                config.containerId
            );

        if (!container) {
            return;
        }


        /*
         * Remove old button
         */

        const oldButton =
            container.querySelector(
                ".add-another-btn"
            );

        if (oldButton) {
            oldButton.remove();
        }


        /*
         * Check entries
         */

        const entries =
            container.querySelectorAll(
                ".entry-card"
            );

        if (entries.length === 0) {
            return;
        }


        /*
         * Create button
         */

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "add-another-btn";

        button.innerHTML =
            "+ Add Another " +
            config.entryName;


        button.addEventListener("click", () => {
            addEntry(activityKey);
        });


        container.appendChild(button);
    }


    /* =====================================================
       SECTION STATE
    ====================================================== */

    function updateSectionState(activityKey) {

        const config =
            activities[activityKey];

        const container =
            document.getElementById(
                config.containerId
            );

        const section =
            document.getElementById(
                config.sectionId
            );


        if (!container || !section) {
            return;
        }


        const entries =
            container.querySelectorAll(
                ".entry-card"
            );


        if (entries.length > 0) {

            section.classList.add(
                "has-entries"
            );

        } else {

            section.classList.remove(
                "has-entries"
            );
        }
    }


    /* =====================================================
       TEMPORARY SUCCESS MESSAGE
    ====================================================== */

    function showTemporaryMessage(
        entryCard,
        message
    ) {

        const messageElement =
            document.createElement("div");


        messageElement.textContent =
            "✓ " + message;


        messageElement.style.cssText = `
            color: #08743b;
            font-size: 12px;
            font-weight: 600;
            padding: 0 18px 12px;
        `;


        entryCard.appendChild(
            messageElement
        );


        setTimeout(() => {

            messageElement.style.transition =
                "opacity 0.3s ease";

            messageElement.style.opacity = "0";


            setTimeout(() => {

                messageElement.remove();

            }, 300);

        }, 1800);
    }


    /* =====================================================
       ADD BUTTON EVENTS
    ====================================================== */

    Object.keys(activities).forEach(
        activityKey => {

            const config =
                activities[activityKey];

            const button =
                document.querySelector(
                    config.buttonSelector
                );


            if (!button) {
                return;
            }


            button.addEventListener(
                "click",
                () => {
                    addEntry(activityKey);
                }
            );

        }
    );


    /* =====================================================
       COLLECT REPORT DATA
    ====================================================== */

    function collectReportData() {

        const reportData = {

            reportDate:
                document.getElementById(
                    "reportDate"
                ).value,

            officerName:
                document.getElementById(
                    "officerName"
                ).value.trim(),

            workingLocation:
                document.getElementById(
                    "workingLocation"
                ).value.trim(),

            attendanceStatus:
                document.querySelector(
                    'input[name="attendance"]:checked'
                )?.value || "",

            farmers: [],

            fieldVisits: [],

            plantations: [],

            plantsLifted: [],

            ffbPurchases: []
        };


        /* =================================================
           NEW FARMERS
        ================================================== */

        document
            .querySelectorAll(
                "#newFarmerEntries .entry-card"
            )
            .forEach(entry => {

                reportData.farmers.push({

                    farmerName:
                        getValue(
                            entry,
                            '[name="farmerName[]"]'
                        ),

                    village:
                        getValue(
                            entry,
                            '[name="farmerVillage[]"]'
                        ),

                    mandal:
                        getValue(
                            entry,
                            '[name="farmerMandal[]"]'
                        ),

                    extentHoldingAcre:
                        getNumber(
                            entry,
                            '[name="extentHolding[]"]'
                        ),

                    borewellOpenwell:
                        getValue(
                            entry,
                            '[name="wellType[]"]'
                        ),

                    existingCrop:
                        getValue(
                            entry,
                            '[name="existingCrop[]"]'
                        ),

                    oilPalmProposedAreaAcre:
                        getNumber(
                            entry,
                            '[name="oilPalmArea[]"]'
                        ),

                    expectedSeason:
                        getValue(
                            entry,
                            '[name="expectedSeason[]"]'
                        ),

                    mobileNo:
                        getValue(
                            entry,
                            '[name="farmerMobile[]"]'
                        ),

                    plantDD:
                        getValue(
                            entry,
                            '[name="plantDD[]"]'
                        ),

                    dripDD:
                        getValue(
                            entry,
                            '[name="dripDD[]"]'
                        ),

                    ddPaidYesNo:
                        getValue(
                            entry,
                            '[name="ddPaid[]"]'
                        ),

                    remarks:
                        getValue(
                            entry,
                            '[name="farmerRemarks[]"]'
                        )
                });

            });


        /* =================================================
           FIELD VISITS
        ================================================== */

        document
            .querySelectorAll(
                "#fieldVisitEntries .entry-card"
            )
            .forEach(entry => {

                reportData.fieldVisits.push({

                    farmerName:
                        getValue(
                            entry,
                            '[name="visitFarmerName[]"]'
                        ),

                    fieldGarden:
                        getValue(
                            entry,
                            '[name="fieldGarden[]"]'
                        ),

                    village:
                        getValue(
                            entry,
                            '[name="visitVillage[]"]'
                        ),

                    mandal:
                        getValue(
                            entry,
                            '[name="visitMandal[]"]'
                        ),

                    noOfAcres:
                        getNumber(
                            entry,
                            '[name="visitAcres[]"]'
                        ),

                    mobileNo:
                        getValue(
                            entry,
                            '[name="visitMobile[]"]'
                        ),

                    plantHealth:
                        getValue(
                            entry,
                            '[name="plantHealth[]"]'
                        ),

                    remarks:
                        getValue(
                            entry,
                            '[name="visitRemarks[]"]'
                        )
                });

            });


        /* =================================================
           PLANTATION COMPLETED
        ================================================== */

        document
            .querySelectorAll(
                "#plantationEntries .entry-card"
            )
            .forEach(entry => {

                reportData.plantations.push({

                    farmerName:
                        getValue(
                            entry,
                            '[name="plantationFarmerName[]"]'
                        ),

                    village:
                        getValue(
                            entry,
                            '[name="plantationVillage[]"]'
                        ),

                    mandal:
                        getValue(
                            entry,
                            '[name="plantationMandal[]"]'
                        ),

                    plantationAcres:
                        getNumber(
                            entry,
                            '[name="plantationAcres[]"]'
                        ),

                    noOfSeedlings:
                        getNumber(
                            entry,
                            '[name="seedlings[]"]'
                        ),

                    nurseryName:
                        getValue(
                            entry,
                            '[name="nurseryName[]"]'
                        ),

                    plantingMethod:
                        getValue(
                            entry,
                            '[name="plantingMethod[]"]'
                        ),

                    remarks:
                        getValue(
                            entry,
                            '[name="plantationRemarks[]"]'
                        )
                });

            });


        /* =================================================
           PLANTS LIFTED
        ================================================== */

        document
            .querySelectorAll(
                "#plantLiftedEntries .entry-card"
            )
            .forEach(entry => {

                reportData.plantsLifted.push({

                    farmerName:
                        getValue(
                            entry,
                            '[name="liftedFarmerName[]"]'
                        ),

                    village:
                        getValue(
                            entry,
                            '[name="liftedVillage[]"]'
                        ),

                    mandal:
                        getValue(
                            entry,
                            '[name="liftedMandal[]"]'
                        ),

                    plantationAcres:
                        getNumber(
                            entry,
                            '[name="liftedPlantation[]"]'
                        ),

                    noOfSeedlings:
                        getNumber(
                            entry,
                            '[name="liftedSeedlings[]"]'
                        ),

                    nurseryName:
                        getValue(
                            entry,
                            '[name="liftedNursery[]"]'
                        ),

                    plantingMethod:
                        getValue(
                            entry,
                            '[name="liftedPlantingMethod[]"]'
                        ),

                    remarks:
                        getValue(
                            entry,
                            '[name="liftedRemarks[]"]'
                        )
                });

            });


        /* =================================================
           FFB PURCHASES
        ================================================== */

        document
            .querySelectorAll(
                "#ffbEntries .entry-card"
            )
            .forEach(entry => {

                reportData.ffbPurchases.push({

                    collectionDate:
                        getValue(
                            entry,
                            '[name="collectionDate[]"]'
                        ),

                    ffbPrice:
                        getNumber(
                            entry,
                            '[name="ffbPrice[]"]'
                        ),

                    quantityDispatchedMt:
                        getNumber(
                            entry,
                            '[name="quantityDispatched[]"]'
                        ),

                    factoryWeighmentMt:
                        getNumber(
                            entry,
                            '[name="factoryWeighment[]"]'
                        ),

                    ffbLoadingCharges:
                        getNumber(
                            entry,
                            '[name="loadingCharges[]"]'
                        ),

                    ffbTransportationCharges:
                        getNumber(
                            entry,
                            '[name="transportCharges[]"]'
                        ),

                    farmerName:
                        getValue(
                            entry,
                            '[name="ffbFarmerName[]"]'
                        ),

                    village:
                        getValue(
                            entry,
                            '[name="ffbVillage[]"]'
                        ),

                    mandal:
                        getValue(
                            entry,
                            '[name="ffbMandal[]"]'
                        ),

                    quantityMt:
                        getNumber(
                            entry,
                            '[name="ffbQuantity[]"]'
                        ),

                    mobileNo:
                        getValue(
                            entry,
                            '[name="ffbMobile[]"]'
                        ),

                    remarks:
                        getValue(
                            entry,
                            '[name="ffbRemarks[]"]'
                        )
                });

            });


        return reportData;
    }


    /* =====================================================
       FORM SUBMIT
       SEND DATA TO BACKEND
    ====================================================== */

    reportForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            /* ---------------------------------------------
               VALIDATE MAIN FORM
            --------------------------------------------- */

            if (!reportForm.checkValidity()) {

                reportForm.reportValidity();

                return;
            }
            /* ---------------------------------------------
               COLLECT DATA
            --------------------------------------------- */

            const reportData =
                collectReportData();


            console.log(
                "Data being sent to backend:",
                reportData
            );


            /* ---------------------------------------------
               SUBMIT BUTTON
            --------------------------------------------- */

            const submitButton =
                document.getElementById(
                    "submitBtn"
                );


            const originalButtonHTML =
                submitButton.innerHTML;


            submitButton.disabled = true;

            submitButton.innerHTML =
                "Submitting...";


            /* ---------------------------------------------
               SEND TO BACKEND
            --------------------------------------------- */

            try {

                const response =
                    await fetch(
                        "api/reports/submit",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    reportData
                                )
                        }
                    );


                /*
                 * Try to read JSON response.
                 */

                const result =
                    await response.json();


                console.log(
                    "Backend response:",
                    result
                );


                /*
                 * Backend returned an error
                 */

                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Failed to submit daily report."
                    );
                }


                /* -----------------------------------------
                   SUCCESS
                ----------------------------------------- */

                const summary =
                    result.summary || {};


                alert(
                    "Daily report submitted successfully!\n\n" +

                    "Report ID: " +
                    (result.reportId || "Created") +

                    "\n\nNew Farmers: " +
                    (summary.farmers ??
                        reportData.farmers.length) +

                    "\nField Visits: " +
                    (summary.fieldVisits ??
                        reportData.fieldVisits.length) +

                    "\nPlantations: " +
                    (summary.plantations ??
                        reportData.plantations.length) +

                    "\nPlants Lifted: " +
                    (summary.plantsLifted ??
                        reportData.plantsLifted.length) +

                    "\nFFB Purchases: " +
                    (summary.ffbPurchases ??
                        reportData.ffbPurchases.length)
                );


                console.log(
                    "Daily report submitted successfully:",
                    result
                );


            } catch (error) {

                console.error(
                    "Report submission error:",
                    error
                );


                alert(
                    "Could not submit the daily report.\n\n" +
                    error.message
                );


            } finally {

                submitButton.disabled = false;

                submitButton.innerHTML =
                    originalButtonHTML;
            }

        }
    );


    /* =====================================================
       PREVENT ACCIDENTAL ENTER SUBMISSION
    ====================================================== */

    reportForm.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                event.target.tagName !== "TEXTAREA"
            ) {

                /*
                 * Allow Enter inside buttons.
                 */

                if (
                    event.target.tagName ===
                    "BUTTON"
                ) {
                    return;
                }


                event.preventDefault();
            }

        }
    );


    /* =====================================================
       CLEAR INVALID STATE WHEN USER TYPES
    ====================================================== */

    reportForm.addEventListener(
        "input",
        event => {

            if (
                event.target.matches(
                    "input, select, textarea"
                )
            ) {

                event.target.classList.remove(
                    "invalid"
                );
            }

        }
    );

});