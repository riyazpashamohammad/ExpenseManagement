import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const commonStyles = StyleSheet.create({
  backgroundImage: {
    width,
    height,
    resizeMode: 'stretch',
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingTop: 24,
    paddingBottom: 48,
    paddingHorizontal: 20,
  },
  cuteImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#A084CA',
    backgroundColor: '#fff0f6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    alignSelf: 'center',
  },
  input: {
    width: '100%',
    maxWidth: 350,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    marginVertical: 8,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  
  pickerWrapper: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#A084CA',
    width: '100%',
    maxWidth: 350,
    overflow: 'hidden',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    color: '#4B3869',
    fontSize: 16,
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignSelf: 'center',
  },
});
