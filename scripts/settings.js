// Day, Time
var DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
var NUM_DAYS_PER_WEEK = DAYS_OF_WEEK.length;
var MIN_TIME = "08:00";
var MAX_TIME = "18:00";

// Types of Schedule
var SCHEDULE_OVERVIEW_TYPE = 0;
var SCHEDULE_RESULT_TYPE = 1;

// Index of Table Scheules
var SCHDEDULE_OVERVIEW_INDEX = 0;

// Top, Left of Table Schedule (%)
var TABLE_SCHEDULE_TOP = 5;
var TABLE_SCHEDULE_LEFT = 5;

// Position of Label Schedule Day/Time (%)
var LABEL_SCHEDULE_DAY_BOTTOM = 20;
var LABEL_SCHEDULE_TIME_RIGHT = 10;
var LABEL_SCHEDULE_TIME_HEIGHT = 5;

// Font size (pt)
var LABEL_SCHEDULE_FONT_SIZE = 8;

// Unique Properties of Schedule Overview (0) /Result (1)
function scheduleProperty(scheduleIndex_) {
    var HOUR_STEP;
    var NUM_TABLE_SCHEDULE_ROWS;
    var NUM_LABELS_SCHEDULE_TIME;
    var SCHEDULE_ID_PREFIX;
    var SCHEDULE_CLASS;
    var HEADER_TITLE_RIGHT_PANEL;
    var LABEL_CLASS_HIDEABLE_CSS_DISPLAY;
    
    // Unique Properties
    if (scheduleIndex_ == SCHDEDULE_OVERVIEW_INDEX) {
        HOUR_STEP = 0.5;
        SCHEDULE_ID_PREFIX = "overview";
        SCHEDULE_CLASS = "overview";
        LABEL_CLASS_HIDEABLE_CSS_DISPLAY = "inline";
    } else {
        HOUR_STEP = 1;
        SCHEDULE_ID_PREFIX = "result-";
        SCHEDULE_CLASS = "result";
        LABEL_CLASS_HIDEABLE_CSS_DISPLAY = "none";
    }
    
    // Common Propoerties
    NUM_TABLE_SCHEDULE_ROWS = numTableScheduleRows(MIN_TIME, MAX_TIME, HOUR_STEP);
    NUM_LABELS_SCHEDULE_TIME = NUM_TABLE_SCHEDULE_ROWS * HOUR_STEP + 1;

    return {
        HOUR_STEP, 
        NUM_TABLE_SCHEDULE_ROWS, 
        NUM_LABELS_SCHEDULE_TIME,
        SCHEDULE_ID_PREFIX, 
        SCHEDULE_CLASS,
        LABEL_CLASS_HIDEABLE_CSS_DISPLAY
    };
}

// $ Elements
var $tableScheduleElemList = [$("#table-schedule-overview"), $("#table-schedule-overview")]
//var $tableScheduleOverviewElem = $("#table-schedule-overview");

// Functions
// Day to Index
function dayToIndex(day_) {
    return DAYS_OF_WEEK.indexOf(day_);
}

// Split time to hour and min
function splitTime(time_) {
    var hour = Number(time_.split(":")[0]);
    var min = Number(time_.split(":")[1]);
    return {hour, min};
}

// Number of Table Schedule Rows from MIN_TIME, MAX_TIME
function numTableScheduleRows(startTime_, endTime_, hourStep_) {
    var startHour = splitTime(startTime_).hour;
    var endHour = splitTime(endTime_).hour;
    return ((endHour - startHour) / hourStep_);
}

// Convert Time string to number (of minutes)
function timeToNumber(time_) {
    var hour = splitTime(time_).hour;
    var min =  splitTime(time_).min;
    return (hour * 60 + min);
}

function timeToPosition(classData_, zOrder_) {
    var top, left, height, width;
    var leftDay, widthDay;
    var z1 = Number(zOrder_.split("/")[0]);
    var z2 = Number(zOrder_.split("/")[1]);

    leftDay = dayToIndex(classData_.dayOfWeek) / NUM_DAYS_PER_WEEK * 100; 
    widthDay = 1 / NUM_DAYS_PER_WEEK * 100;
    
    top = (timeToNumber(classData_.startTime) - timeToNumber(MIN_TIME)) / (timeToNumber(MAX_TIME) - timeToNumber(MIN_TIME)) * 100;
    height = (timeToNumber(classData_.endTime) - timeToNumber(classData_.startTime)) / (timeToNumber(MAX_TIME) - timeToNumber(MIN_TIME)) * 100;

    width = widthDay / z2;
    left = leftDay + width * (z1 - 1);

    return {top, left, height, width};
}

function hour24ToAP(hour_) {
    var hourAP;
    var ap;
    if (hour_ == 12) {
        hourAP = 12;
    } else if (hour_ == 24) {
        hourAP = 12;
    } else {
        hourAP = hour_ % 12;
    }
    var ap = hour_ < 12 ? "am" : "pm";
    return {hourAP, ap}
}

function time24ToAP(time_) {
    var hourAP = hour24ToAP(splitTime(time_).hour).hourAP;
    var min = splitTime(time_).min;
    var ap = hour24ToAP(splitTime(time_).hour).ap;
    return (hourAP + ":" + min + ap);
}

function toTimeArray(minTime_, maxTime_) {
    var timeArray = [];
    var minHour = Number(minTime_.split(":")[0]);
    var maxHour = Number(maxTime_.split(":")[0]);
    for (var hour = minHour; hour <= maxHour; hour++) {
        var hourAP = hour24ToAP(hour).hourAP;
        var ap = hour24ToAP(hour).ap;
        timeArray.push(hourAP + ":00" + ap);
    }
    return timeArray;
}

function isClassOverlapping(classA_, classB_) {
    var overlap;
    if (classA_ == undefined || classB_ == undefined) {
        overlap = false;
    } else {
        var dayOfWeekA = classA_.classData.dayOfWeek;
        var dayOfWeekB = classB_.classData.dayOfWeek;
        var numStartTimeA = timeToNumber(classA_.classData.startTime);
        var numEndTimeA = timeToNumber(classA_.classData.endTime);
        var numStartTimeB = timeToNumber(classB_.classData.startTime);
        var numEndTimeB = timeToNumber(classB_.classData.endTime);
        overlap = (dayOfWeekA == dayOfWeekB && 
            ((numStartTimeB <= numStartTimeA && numStartTimeA < numEndTimeB) ||
            (numStartTimeA <= numStartTimeB && numStartTimeB < numEndTimeA)));
    }
    return overlap;
}

function isSectionOverlapping(sectionA_, sectionB_) {
    var overlap;
    if (sectionA_ == undefined || sectionB_ == undefined) {
        overlap = false;
    } else {
        for (var a = 0; a < sectionA_.classList.length; a++) {
            var classA = sectionA_.classList[a];
            for (var b = 0; b < sectionB_.classList.length; b++) {
                var classB = sectionB_.classList[b];
                if (isClassOverlapping(classA, classB)) {
                    overlap = true;
                    break;
                }
            }
            if (overlap) {
                break;
            }
        }
    }
    return overlap;
}

function isSectionListOverlapping(sectionListA_, sectionB_) {
    var overlap = false;
    if (sectionListA_ == undefined || sectionB_ == undefined) {
        overlap = false;
    } else {
        for (var i = 0; i < sectionListA_.length; i++) {
            if (isSectionOverlapping(sectionListA_[i], sectionB_)) {
                overlap = true;
                break;
            }
        }
    }
    return overlap;
}

function appendToNewArray(array_, newItem) {
    var tmpArray = array_.slice(0);
    tmpArray.push(newItem);
    return tmpArray;
}

function deepCopySection(section_) {
    var sectionTmp = new Section(section_.courseCode, section_.sectionData);
    return sectionTmp;
}

function deepCopySectionList(sectionList_) {
    var sectionListTmp = new Array();
    for (var i = 0; i < sectionList_.length; i++) {
        var sectionTmp = deepCopySection(sectionList_[i]);
        sectionListTmp.push(sectionTmp);
    }
    return sectionListTmp;
}

function combineSections(courseList_) {
    var sectionCombList = new Array();
    
    for (var i = 0; i < courseList_[0].sectionList.length; i++) {
        sectionCombList[i] = new Array();
        sectionCombList[i].push(courseList_[0].sectionList[i]);
    }
    
    var courseCount = courseList_.length;
    for (var courseIndex = 0; courseIndex < courseCount - 1; courseIndex++) {
        var currentCourse = courseList_[courseIndex];
        var currentCourseSectionCount = currentCourse.sectionList.length;
        
        var nextCourse = courseList_[courseIndex + 1];
        var nextCourseSectionCount = nextCourse.sectionList.length;
        
        for (var currentCourseSectionIndex = 0; currentCourseSectionIndex < currentCourseSectionCount; currentCourseSectionIndex++) {
            var currentCourseCurrentSection = currentCourse.sectionList[currentCourseSectionIndex];
            for (var nextCourseSectionIndex = 0; nextCourseSectionIndex < nextCourseSectionCount; nextCourseSectionIndex++) {
                var nextCourseCurrentSection = nextCourse.sectionList[nextCourseSectionIndex];
                for (var sectionCombIndex = 0; sectionCombIndex < sectionCombList.length; sectionCombIndex++) {
                    if (sectionCombList[sectionCombIndex].indexOf(currentCourseCurrentSection) >= 0 &&
                        sectionCombList[sectionCombIndex].length == (courseIndex + 1)) {
                        if (!isSectionListOverlapping(sectionCombList[sectionCombIndex], nextCourseCurrentSection)) {
                            sectionCombList.push(appendToNewArray(sectionCombList[sectionCombIndex], nextCourseCurrentSection));
                        }
                    }
                }
            }
        }
    }
    
    var validSectionCombList = new Array();
    for (var i = 0; i < sectionCombList.length; i++) {
        if (sectionCombList[i].length == courseCount) {
            validSectionCombList.push(deepCopySectionList(sectionCombList[i]));
        }
    }
    return validSectionCombList;
}



