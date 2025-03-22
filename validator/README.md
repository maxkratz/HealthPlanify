# Validator Outputs

## ../solution/toy_solution1.json
```
VIOLATIONS: 
RoomGenderMix.....................2
PatientRoomCompatibility..........0
SurgeonOvertime...................0
OperatingTheaterOvertime..........0
MandatoryUnscheduledPatients......0
AdmissionDay......................0
RoomCapacity......................1
NursePresence.....................0
UncoveredRoom.....................0
Total violations = 3

COSTS (weight X cost): 
RoomAgeMix............................10 (  5 X   2)
RoomSkillLevel........................48 (  1 X  48)
ContinuityOfCare......................66 (  1 X  66)
ExcessiveNurseWorkload.................5 (  1 X   5)
OpenOperatingTheater.................200 ( 50 X   4)
SurgeonTransfer........................0 (  5 X   0)
PatientDelay...........................0 ( 10 X   0)
ElectiveUnscheduledPatients............0 (300 X   0)
Total cost = 329
```



## ../solution/toy_solution2.json
```
VIOLATIONS: 
RoomGenderMix.....................1
PatientRoomCompatibility..........0
SurgeonOvertime...................0
OperatingTheaterOvertime..........0
MandatoryUnscheduledPatients......0
AdmissionDay......................0
RoomCapacity......................0
NursePresence.....................0
UncoveredRoom.....................0
Total violations = 1

COSTS (weight X cost): 
RoomAgeMix............................10 (  5 X   2)
RoomSkillLevel........................48 (  1 X  48)
ContinuityOfCare......................66 (  1 X  66)
ExcessiveNurseWorkload.................5 (  1 X   5)
OpenOperatingTheater.................200 ( 50 X   4)
SurgeonTransfer........................0 (  5 X   0)
PatientDelay...........................0 ( 10 X   0)
ElectiveUnscheduledPatients............0 (300 X   0)
Total cost = 329
```



## ../ihtc2024_test_solutions/sol_test10.json 
```
VIOLATIONS: 
RoomGenderMix.....................0
PatientRoomCompatibility..........0
SurgeonOvertime...................0
OperatingTheaterOvertime..........0
MandatoryUnscheduledPatients......0
AdmissionDay......................0
RoomCapacity......................0
NursePresence.....................0
UncoveredRoom.....................0
Total violations = 0

COSTS (weight X cost): 
RoomAgeMix...........................274 (  1 X 274)
RoomSkillLevel......................1220 ( 10 X 122)
ContinuityOfCare...................13965 (  5 X 2793)
ExcessiveNurseWorkload...............605 (  5 X 121)
OpenOperatingTheater................4650 ( 50 X  93)
SurgeonTransfer......................490 ( 10 X  49)
PatientDelay.......................10240 ( 10 X 1024)
ElectiveUnscheduledPatients........18000 (300 X  60)
Total cost = 49444
```