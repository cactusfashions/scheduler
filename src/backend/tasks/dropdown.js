// GetCategory	Priority	Decision	Delegate to , from dropdowns sheet
function getDropdownData() {
  try {
    const sheet = new SheetManager(SCHEDULER_SS_ID, DROPDOWN_SHEET);
    const data = JSON.parse(sheet.getData().data);
    const categories = data.map((row) => row['category']).filter(Boolean);
    const priorities = data.map((row) => row['priority']).filter(Boolean);
    const decisions = data
      .map((row) =>
        row['decision'] &&
        row['decision'].trim().toLowerCase() !== '' &&
        row['decision'].trim().toLowerCase() !== 'delete'
          ? row['decision']
          : null
      )
      .filter(Boolean);
    const delegateTo = data
      .map((row) => row['delegate to'].split('-')[0])
      .filter(Boolean);
    return { categories, priorities, decisions, delegateTo };
  } catch (e) {
    console.log(e.message);
    throw new Error(e.message);
  }
}
