import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens - yazım hatasını düzelttik
import Home from '../screens/Home';
import AddExpense from '../screens/AddExpense';
import AddIncome from '../screens/AddIncome';
import AllExpenses from '../screens/AllExpenses';
import AllIncomes from '../screens/ALLLncomes'; // Düzeltildi: ALLLncomes → AllIncomes
import ExpenseEdit from '../screens/ExpenseEdit';
import IncomeEdit from '../screens/IncomeEdit';
import CategoryAdd from '../screens/CategoryAdd';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#3498db',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={Home} 
          options={{ title: 'Bütçe Uygulaması' }}
        />
        <Stack.Screen 
          name="AddExpense" 
          component={AddExpense} 
          options={{ title: 'Gider Ekle' }}
        />
        <Stack.Screen 
          name="AddIncome" 
          component={AddIncome} 
          options={{ title: 'Gelir Ekle' }}
        />
        <Stack.Screen 
          name="AllExpenses" 
          component={AllExpenses} 
          options={{ title: 'Tüm Giderler' }}
        />
        <Stack.Screen 
          name="AllIncomes" 
          component={AllIncomes} 
          options={{ title: 'Tüm Gelirler' }}
        />
        <Stack.Screen 
          name="ExpenseEdit" 
          component={ExpenseEdit} 
          options={{ title: 'Gider Düzenle' }}
        />
        <Stack.Screen 
          name="IncomeEdit" 
          component={IncomeEdit} 
          options={{ title: 'Gelir Düzenle' }}
        />
        <Stack.Screen 
          name="CategoryAdd" 
          component={CategoryAdd} 
          options={{ title: 'Kategori Yönetimi' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;