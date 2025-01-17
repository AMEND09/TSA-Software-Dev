import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Droplet, Leaf, Sun, LayoutDashboard } from 'lucide-react';

interface WaterUsage {
  amount: number;
  date: string;
}

interface Field {
  id: number;
  name: string;
  size: string;
  crop: string;
  waterHistory: WaterUsage[];
  fertilizerHistory: any[];
  harvestHistory: any[];
}

const DefaultComponent: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [isAddingField, setIsAddingField] = useState(false);
  const [newField, setNewField] = useState({ name: '', size: '', crop: '' });
  const [newWaterUsage, setNewWaterUsage] = useState({ fieldId: '', amount: '', date: '' });
  const [isAddingWaterUsage, setIsAddingWaterUsage] = useState(false);
  const [isAddingFertilizer, setIsAddingFertilizer] = useState(false);
  const [isAddingHarvest, setIsAddingHarvest] = useState(false);
  const [newFertilizer, setNewFertilizer] = useState({ fieldId: '', type: '', amount: '', date: '' });
  const [newHarvest, setNewHarvest] = useState({ fieldId: '', amount: '', date: '' });

  const handleAddField = () => {
    setFields([...fields, {
      id: fields.length + 1,
      name: newField.name,
      size: newField.size,
      crop: newField.crop,
      waterHistory: [],
      fertilizerHistory: [],
      harvestHistory: []
    }]);
    setIsAddingField(false);
    setNewField({ name: '', size: '', crop: '' });
  };

  const handleAddWaterUsage = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFields = fields.map(field => {
      if (field.id === parseInt(newWaterUsage.fieldId)) {
        return {
          ...field,
          waterHistory: [...field.waterHistory, {
            amount: parseFloat(newWaterUsage.amount),
            date: newWaterUsage.date
          }]
        };
      }
      return field;
    });
    setFields(updatedFields);
    setNewWaterUsage({ fieldId: '', amount: '', date: '' });
  };

  const handleAddFertilizer = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFields = fields.map(field => {
      if (field.id === parseInt(newFertilizer.fieldId)) {
        return {
          ...field,
          fertilizerHistory: [...field.fertilizerHistory, {
            type: newFertilizer.type,
            amount: parseFloat(newFertilizer.amount),
            date: newFertilizer.date
          }]
        };
      }
      return field;
    });
    setFields(updatedFields);
    setIsAddingFertilizer(false);
    setNewFertilizer({ fieldId: '', type: '', amount: '', date: '' });
  };

  const handleAddHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFields = fields.map(field => {
      if (field.id === parseInt(newHarvest.fieldId)) {
        return {
          ...field,
          harvestHistory: [...field.harvestHistory, {
            amount: parseFloat(newHarvest.amount),
            date: newHarvest.date
          }]
        };
      }
      return field;
    });
    setFields(updatedFields);
    setIsAddingHarvest(false);
    setNewHarvest({ fieldId: '', amount: '', date: '' });
  };

  // Calculate sustainability metrics
  const sustainabilityMetrics = useMemo(() => {
    if (fields.length === 0) return null;

    const waterEfficiency = fields.map(field => {
      const totalWaterUsage = field.waterHistory.reduce((sum, record) => sum + record.amount, 0);
      const averageWaterPerAcre = totalWaterUsage / parseFloat(field.size);
      return Math.min(100, (2000 / (averageWaterPerAcre || 2000)) * 100);
    });

    const organicScore = fields.map(field => {
      const fertilizerUse = field.fertilizerHistory.reduce((sum, record) => sum + record.amount, 0);
      const avgFertilizerPerAcre = fertilizerUse / parseFloat(field.size);
      return Math.min(100, (100 / (avgFertilizerPerAcre || 100)) * 100);
    });

    const harvestEfficiency = fields.map(field => {
      const totalHarvest = field.harvestHistory.reduce((sum, record) => sum + record.amount, 0);
      const avgHarvestPerAcre = totalHarvest / parseFloat(field.size);
      return Math.min(100, (avgHarvestPerAcre / 180) * 100);
    });

    const avgWaterEfficiency = waterEfficiency.reduce((sum, val) => sum + val, 0) / waterEfficiency.length;
    const avgOrganicScore = organicScore.reduce((sum, val) => sum + val, 0) / organicScore.length;
    const avgHarvestEfficiency = harvestEfficiency.reduce((sum, val) => sum + val, 0) / harvestEfficiency.length;

    const overallScore = Math.round(
      (avgWaterEfficiency * 0.4) +
      (avgOrganicScore * 0.4) +
      (avgHarvestEfficiency * 0.2)
    );

    return {
      overallScore,
      waterEfficiency: Math.round(avgWaterEfficiency),
      organicScore: Math.round(avgOrganicScore),
      harvestEfficiency: Math.round(avgHarvestEfficiency)
    };
  }, [fields]);

  const SustainabilityScoreCard = () => (
    <Card>
      <CardHeader>
        <CardTitle>Sustainability Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-6xl font-bold mb-4" style={{
            color: sustainabilityMetrics?.overallScore! >= 80 ? '#16a34a' : 
                   sustainabilityMetrics?.overallScore! >= 60 ? '#ca8a04' : '#dc2626'
          }}>
            {sustainabilityMetrics ? sustainabilityMetrics.overallScore : '-'}
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Water Efficiency</p>
              <p className="font-medium text-blue-600">
                {sustainabilityMetrics ? `${sustainabilityMetrics.waterEfficiency}%` : '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Organic Practices</p>
              <p className="font-medium text-green-600">
                {sustainabilityMetrics ? `${sustainabilityMetrics.organicScore}%` : '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Harvest Efficiency</p>
              <p className="font-medium text-yellow-600">
                {sustainabilityMetrics ? `${sustainabilityMetrics.harvestEfficiency}%` : '-'}
              </p>
            </div>
          </div>
          {sustainabilityMetrics && (
            <div className="mt-4 text-sm text-gray-500">
              <p className="mb-2">Recommendations:</p>
              <ul className="text-left list-disc pl-4 space-y-1">
                {sustainabilityMetrics.waterEfficiency < 80 && (
                  <li>Consider implementing drip irrigation to improve water efficiency</li>
                )}
                {sustainabilityMetrics.organicScore < 80 && (
                  <li>Explore organic fertilizer alternatives</li>
                )}
                {sustainabilityMetrics.harvestEfficiency < 80 && (
                  <li>Review crop density and soil health management</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Farm Management Dashboard</h1>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="water">Water Management</TabsTrigger>
            <TabsTrigger value="crops">Crops</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Dialog open={isAddingWaterUsage} onOpenChange={setIsAddingWaterUsage}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-blue-500 hover:bg-blue-600">
                          <Droplet className="h-4 w-4 mr-2" />
                          Record Water Usage
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Record Water Usage</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddWaterUsage} className="space-y-4">
                          <div>
                            <Label>Field</Label>
                            <select 
                              className="w-full p-2 border rounded"
                              value={newWaterUsage.fieldId}
                              onChange={(e) => setNewWaterUsage({...newWaterUsage, fieldId: e.target.value})}
                              required
                            >
                              <option value="">Select Field</option>
                              {fields.map(field => (
                                <option key={field.id} value={field.id}>{field.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label>Amount (gallons)</Label>
                            <Input 
                              type="number"
                              value={newWaterUsage.amount}
                              onChange={(e) => setNewWaterUsage({...newWaterUsage, amount: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <Label>Date</Label>
                            <Input 
                              type="date"
                              value={newWaterUsage.date}
                              onChange={(e) => setNewWaterUsage({...newWaterUsage, date: e.target.value})}
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full">Save Water Usage</Button>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isAddingFertilizer} onOpenChange={setIsAddingFertilizer}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-green-500 hover:bg-green-600">
                          <Leaf className="h-4 w-4 mr-2" />
                          Record Fertilizer Application
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Record Fertilizer Application</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddFertilizer} className="space-y-4">
                          <div>
                            <Label>Field</Label>
                            <select 
                              className="w-full p-2 border rounded"
                              value={newFertilizer.fieldId}
                              onChange={(e) => setNewFertilizer({...newFertilizer, fieldId: e.target.value})}
                              required
                            >
                              <option value="">Select Field</option>
                              {fields.map(field => (
                                <option key={field.id} value={field.id}>{field.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label>Type</Label>
                            <Input 
                              value={newFertilizer.type}
                              onChange={(e) => setNewFertilizer({...newFertilizer, type: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <Label>Amount (lbs)</Label>
                            <Input 
                              type="number"
                              value={newFertilizer.amount}
                              onChange={(e) => setNewFertilizer({...newFertilizer, amount: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <Label>Date</Label>
                            <Input 
                              type="date"
                              value={newFertilizer.date}
                              onChange={(e) => setNewFertilizer({...newFertilizer, date: e.target.value})}
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full">Save Fertilizer Application</Button>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isAddingHarvest} onOpenChange={setIsAddingHarvest}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-purple-500 hover:bg-purple-600">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Record Harvest
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Record Harvest</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddHarvest} className="space-y-4">
                          <div>
                            <Label>Field</Label>
                            <select 
                              className="w-full p-2 border rounded"
                              value={newHarvest.fieldId}
                              onChange={(e) => setNewHarvest({...newHarvest, fieldId: e.target.value})}
                              required
                            >
                              <option value="">Select Field</option>
                              {fields.map(field => (
                                <option key={field.id} value={field.id}>{field.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label>Amount (bushels)</Label>
                            <Input 
                              type="number"
                              value={newHarvest.amount}
                              onChange={(e) => setNewHarvest({...newHarvest, amount: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <Label>Date</Label>
                            <Input 
                              type="date"
                              value={newHarvest.date}
                              onChange={(e) => setNewHarvest({...newHarvest, date: e.target.value})}
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full">Save Harvest</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
              <SustainabilityScoreCard />
            </div>
          </TabsContent>

          <TabsContent value="water">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Water Usage Tracker</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {fields.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={fields.flatMap(field => 
                          field.waterHistory.map(usage => ({
                            field: field.name,
                            amount: usage.amount,
                            date: new Date(usage.date).toLocaleDateString()
                          }))
                        )}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="amount" fill="#3b82f6" name="Water Usage (gal)" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        No water usage data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="crops">
  <div className="space-y-4">
    <Button
      onClick={() => setIsAddingField(true)}
      className="mb-4"
    >
      Add New Field
    </Button>


                <Dialog open={isAddingField} onOpenChange={setIsAddingField}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Field</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddField} className="space-y-4">
                      <div>
                        <Label>Field Name</Label>
                        <Input
                          value={newField.name}
                          onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Size (acres)</Label>
                        <Input
                          type="number"
                          value={newField.size}
                          onChange={(e) => setNewField({ ...newField, size: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Crop Type</Label>
                        <Input
                          value={newField.crop}
                          onChange={(e) => setNewField({ ...newField, crop: e.target.value })}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Add Field
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.length > 0 ? (
                    fields.map((field) => (
                      <Card
                        key={field.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                      >
                        <CardHeader>
                          <CardTitle>{field.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-gray-500">Crop: {field.crop}</p>
                            <p className="text-gray-500">Size: {field.size} acres</p>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Droplet className="h-4 w-4 text-blue-500" />
                                <span>
                                  Last watered:{" "}
                                  {field.waterHistory.length > 0
                                    ? new Date(
                                        field.waterHistory[field.waterHistory.length - 1].date
                                      ).toLocaleDateString()
                                    : "Never"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Leaf className="h-4 w-4 text-green-500" />
                                <span>
                                  Last fertilized:{" "}
                                  {field.fertilizerHistory.length > 0
                                    ? new Date(
                                        field.fertilizerHistory[field.fertilizerHistory.length - 1]
                                          .date
                                      ).toLocaleDateString()
                                    : "Never"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <LayoutDashboard className="h-4 w-4 text-purple-500" />
                                <span>
                                  Last harvest:{" "}
                                  {field.harvestHistory.length > 0
                                    ? new Date(
                                        field.harvestHistory[field.harvestHistory.length - 1].date
                                      ).toLocaleDateString()
                                    : "Never"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-2 text-center p-8 border rounded-lg border-dashed">
                      <p className="text-gray-500">
                        No fields added yet. Click "Add New Field" to get started.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reports">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Field Performance Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {fields.length > 0 ? (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <Droplet className="h-6 w-6 text-blue-500 mb-2" />
                            <p className="text-sm text-gray-500">Total Water Usage</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {fields
                                .reduce(
                                  (total, field) =>
                                    total +
                                    field.waterHistory.reduce(
                                      (sum, record) => sum + record.amount,
                                      0
                                    ),
                                  0
                                )
                                .toLocaleString()}{" "}
                              gal
                            </p>
                          </div>
                          <div className="p-4 bg-green-50 rounded-lg">
                            <Leaf className="h-6 w-6 text-green-500 mb-2" />
                            <p className="text-sm text-gray-500">Total Fertilizer Used</p>
                            <p className="text-2xl font-bold text-green-600">
                              {fields
                                .reduce(
                                  (total, field) =>
                                    total +
                                    field.fertilizerHistory.reduce(
                                      (sum, record) => sum + record.amount,
                                      0
                                    ),
                                  0
                                )
                                .toLocaleString()}{" "}
                              lbs
                            </p>
                          </div>
                          <div className="p-4 bg-yellow-50 rounded-lg">
                            <Sun className="h-6 w-6 text-yellow-500 mb-2" />
                            <p className="text-sm text-gray-500">Total Harvest</p>
                            <p className="text-2xl font-bold text-yellow-600">
                              {fields
                                .reduce(
                                  (total, field) =>
                                    total +
                                    field.harvestHistory.reduce(
                                      (sum, record) => sum + record.amount,
                                      0
                                    ),
                                  0
                                )
                                .toLocaleString()}{" "}
                              bu
                            </p>
                          </div>
                        </div>

                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={fields.flatMap((field) =>
                                field.harvestHistory.map((harvest) => ({
                                  field: field.name,
                                  amount: harvest.amount,
                                  date: new Date(harvest.date).toLocaleDateString(),
                                }))
                              )}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="#8884d8"
                                name="Harvest Amount (bu)"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-8">
                        <p className="text-gray-500">
                          No data available. Add fields and record activities to see reports.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
  );
};

export default DefaultComponent;
