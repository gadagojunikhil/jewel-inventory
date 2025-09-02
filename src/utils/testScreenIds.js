// Test file to verify screenIds import
import SCREEN_IDS, { getScreenInfo, isValidScreenId } from './screenIds';

console.log('SCREEN_IDS:', SCREEN_IDS);
console.log('ADMINISTRATION:', SCREEN_IDS.ADMINISTRATION);
console.log('USER_MANAGEMENT:', SCREEN_IDS.ADMINISTRATION?.USER_MANAGEMENT);

export const testScreenIds = () => {
  return {
    screenIds: SCREEN_IDS,
    admin: SCREEN_IDS.ADMINISTRATION,
    userManagement: SCREEN_IDS.ADMINISTRATION?.USER_MANAGEMENT
  };
};
