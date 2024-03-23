import { Button, Card, Backdrop, CircularProgress, TextField, IconButton, Stack, Typography, Container, Unstable_Grid2 as Grid, Divider, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Autocomplete, ListItem, ListItemText, Box } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import { GrUserAdmin } from "react-icons/gr";
import { IoIosRemoveCircle, IoMdSearch, IoMdSync } from "react-icons/io";
import * as Papa from 'papaparse';

function Checkout() {
    const [cart, setCart] = useState([]);
    const [catalog, setCatalog] = useState({})
    const [inventory, setInventory] = useState({})
    const [inventoryList, setInventoryList] = useState([])
    const [adminMode, setAdminMode] = useState(false)
    const [searchDialogue, setSearchDialogue] = useState(false)
    const [buffer, setBuffer] = useState(new Set())

    const loadDatabase = () => {
        fetch('./data/catalog.csv').then(response => response.text()).then(csvString => Papa.parse(csvString, {header:true, skipEmptyLines:true}))
        .then(csvArray => csvArray.data.reduce((csvMap, type) => {csvMap[type.id]={...type, price:parseFloat(type.price)}; return csvMap}, {}))
        .then(csvMap => setCatalog(csvMap))
        fetch('./data/inventory.csv').then(response => response.text()).then(csvString => Papa.parse(csvString, {header:true, skipEmptyLines:true}))
        .then(csvArray => csvArray.data.reduce((csvMap, item) => {csvMap[item.id]=item; return csvMap}, {}))
        .then(csvMap => setInventory(csvMap))
    }

    useEffect(() => {
        loadDatabase()
        window.electronAPI.onUpdateRFID((value) => {
            console.log(value)
            setBuffer(new Set(value))
        })
    },[])

    useEffect(() => {
        const newItems = buffer.difference(new Set(cart))
        if (newItems.size > 0 && !processing) {
            setCart((c) => [...c, ...newItems.values()])
        }
    },[buffer])

    useEffect(() => {
        setInventoryList(Object.keys(inventory).map((key) => inventory[key]))
    },[inventory])

    const scrollRef = useRef(null)
    const scrollToBottom = () => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }

    useEffect(() => {
        scrollToBottom()
    },[cart])

    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        if (processing) {
            setTimeout(()=>{
                setProcessing(false)
                setCart([])
            }, 1000)
        }
    },[processing])

    return (
        <Container maxWidth="xl" sx={{height: "100vh", padding: "1rem", backgroundColor: "#fffef5"}}>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={processing}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Dialog open={searchDialogue} onClose={() => setSearchDialogue(false)} PaperProps={{
                component: 'form',
                onSubmit: (event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    const formJson = Object.fromEntries(formData.entries());
                    const item = formJson.item;
                    setCart([...cart, item])
                    setSearchDialogue(false)
                }
            }}>
                <DialogTitle>
                    Manual Item Addition
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please provide the id of the item to add to the cart.
                    </DialogContentText>
                    <Autocomplete
                        sx={{marginTop:"1rem"}}
                        options={inventoryList}
                        getOptionLabel={
                            (option) => option.id
                        }
                        renderInput={(params) => {
                            return(<TextField {...params} required name="item" label="Item Id" />)
                        }}
                        renderOption={(props, option) => (
                            <ListItem {...props}>
                                <ListItemText
                                    primary={catalog[option.type]?.name || "unknown type"}
                                    secondary={"id: "+option.id}
                                />
                            </ListItem>
                        )}
                    />
                    <DialogActions>
                        <Button variant="contained" type="submit">Add to Cart</Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
            <Grid
                container
                spacing={3}
                sx={{height: "100%"}}
            >
                <Grid
                    xs={8}
                    sx={{height: "100%"}}
                >
                    <Card raised={false} sx={{height: "100%"}}><Stack direction='column' spacing={0} sx={{height: '100%', width: '100%'}}>
                        <Stack direction='column' spacing={0} sx={{padding: '2rem', overflow: 'auto'}}>
                            {cart.map((itemId) => (
                                <Stack key={itemId} spacing={0} direction='row' justifyContent="center" alignItems="center">
                                    <ListItem sx={{padding: 0}}>
                                        <ListItemText
                                            size
                                            primary={<Typography variant="body1">{catalog[inventory[itemId]?.type]?.name || "unknown type"}</Typography>}
                                            secondary={"id: "+itemId}
                                        />
                                    </ListItem>
                                    <Stack direction='row' alignItems="center" sx={{marginLeft: 'auto'}}>
                                        <Typography variant="body1" sx={{marginRight:"1rem"}}>${catalog[inventory[itemId]?.type]?.price || "NA"}</Typography>
                                        <IconButton onClick={() => setCart(cart.filter(item => item != itemId))} disabled={!adminMode} color="error"><IoIosRemoveCircle /></IconButton>
                                    </Stack>
                                </Stack>
                            ))}
                            <Box ref={scrollRef}/>
                        </Stack>
                        <Divider variant="middle" sx={{marginTop: "auto"}}/>
                        <Stack direction='row' justifyContent="flex-start" sx={{paddingTop:"1rem", paddingBottom: "1rem", paddingLeft:"2rem", width: '100%'}}>
                            <Stack spacing={1} direction='column' sx={{marginRight: '2rem'}}>
                                <Typography variant="h5" gutterBottom>
                                    Sub-total:
                                </Typography>
                                <Typography variant="h6" gutterBottom>
                                    Tax:
                                </Typography>
                                <Typography variant="h4" gutterBottom>
                                    Total:
                                </Typography>
                            </Stack>
                            <Stack spacing={1} direction='column' alignItems="flex-end">
                                <Typography variant="h5" gutterBottom>
                                    ${parseFloat(cart.reduce((acc, curr) => acc + (catalog[inventory[curr]?.type]?.price || 0), 0)).toFixed(2)}
                                </Typography>
                                <Typography variant="h6" gutterBottom>
                                    ${parseFloat(0.13*cart.reduce((acc, curr) => acc + (catalog[inventory[curr]?.type]?.price || 0), 0)).toFixed(2)}
                                </Typography>
                                <Typography variant="h4" gutterBottom>
                                    ${parseFloat(1.13*cart.reduce((acc, curr) => acc + (catalog[inventory[curr]?.type]?.price || 0), 0)).toFixed(2)}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack></Card>
                </Grid>
                <Grid
                    xs={4}
                    sx={{height: "100%"}}
                >
                    <Stack direction='column' sx={{ height: '100%', width: '100%'}}>
                        <Stack justifyContent="center" direction='column' alignItems="center" sx={{height: '85%', width: '100%'}}>
                            <Button onClick={()=>{
                                setProcessing(true)
                            }} variant="contained"><Typography margin="1rem" variant="h3">Pay</Typography></Button>
                        </Stack>
                        <Stack justifyContent="flex-end" direction='row' alignItems="center" sx={{marginTop: "auto", width: '100%'}}>
                            <IconButton onClick={()=>setSearchDialogue(true)} color="error" disabled={!adminMode}><IoMdSearch /></IconButton>
                            <IconButton onClick={()=>{
                                    loadDatabase()
                                }
                            } color="error" disabled={!adminMode}><IoMdSync /></IconButton>
                            <FormControlLabel control={<Switch checked={adminMode} onChange={(event => (setAdminMode(event.target.checked)))} label="Admin" color="error" />} labelPlacement="bottom" label={<GrUserAdmin />}/>
                        </Stack>
                    </Stack>
                </Grid>
            </Grid>
        </Container>
    );
  }
  
  export default Checkout;