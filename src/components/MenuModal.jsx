import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

const MenuModal = ({ visible, onClose }) => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const isRTL = i18n.language === 'ar';

  const menuItems = [
    { key: 'About', title: t('about') || 'About', icon: 'info' },
    { key: 'Contact', title: t('contact') || 'Contact', icon: 'contact-mail' },
    { key: 'Copyright', title: t('copyright') || 'Copyright', icon: 'copyright' },
    { key: 'Disclaimer', title: t('disclaimer') || 'Disclaimer', icon: 'warning' },
    { key: 'Settings', title: t('settings') || 'Settings', icon: 'settings' },
    { key: 'UserGuide', title: t('userguide') || 'User Guide', icon: 'help' },
  ];

  const handleMenuItemPress = (screenName) => {
    onClose();
    navigation.navigate(screenName);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={[
          styles.dropdownContainer,
          isRTL ? styles.dropdownRTL : styles.dropdownLTR
        ]}>
          {menuItems.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.menuItem,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' }
                ]}
                onPress={() => handleMenuItemPress(item.key)}
                activeOpacity={0.7}
              >
                <Icon 
                  name={item.icon} 
                  size={20} 
                  color="#4CAF50" 
                  style={[
                    styles.menuIcon,
                    isRTL ? { marginLeft: 15, marginRight: 0 } : { marginRight: 15, marginLeft: 0 }
                  ]} 
                />
                <Text style={[
                  styles.menuItemText,
                  { textAlign: isRTL ? 'right' : 'left' }
                ]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const HEADER_HEIGHT = 90; // Approximate header height

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dropdownContainer: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    backgroundColor: '#fff',
    minWidth: 200,
    maxWidth: width * 0.8,
    maxHeight: 400,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderRadius: 8,
    paddingVertical: 8,
  },
  dropdownLTR: {
    left: 10,
  },
  dropdownRTL: {
    right: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 6,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
});

export default MenuModal;